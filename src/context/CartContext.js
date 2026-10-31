import React, { createContext, useEffect, useState } from 'react';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from './AuthContext';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!user) setCartItems([]);
  }, [user]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item) => {
    const quantityToAdd = item.quantity || 1;
    if (item.sellerId && item.sellerId === auth.currentUser?.uid) return false;
    if (!item.stock || quantityToAdd > item.stock) return false;

    const existing = cartItems.find((entry) => entry.id === item.id);
    if (existing && existing.quantity + quantityToAdd > item.stock) return false;

    setCartItems((prev) => {
      const current = prev.find((entry) => entry.id === item.id);
      const quantity = (current?.quantity || 0) + quantityToAdd;
      if (!item.stock || quantity > item.stock) return prev;

      if (current) {
        return prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity,
                stock: item.stock,
                price: item.price,
                deliveryFee: item.deliveryFee,
                image: item.image,
                sellerName: item.sellerName,
              }
            : entry
        );
      }

      return [...prev, { ...item, quantity: quantityToAdd }];
    });

    return true;
  };

  const updateQuantity = (id, quantity, stock) => {
    setCartItems((prev) =>
      prev.flatMap((item) => {
        if (item.id !== id) return [item];
        if (quantity <= 0) return [];
        const limit = stock ?? item.stock ?? quantity;
        if (quantity > limit) return [{ ...item, stock: limit }];
        return [{ ...item, quantity, stock: limit }];
      })
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const placeOrder = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Sipariş için giriş yapmalısınız.');
    if (cartItems.length === 0) throw new Error('Sepetiniz boş.');

    const items = cartItems.map((item) => ({ ...item }));

    await runTransaction(db, async (transaction) => {
      const snapshots = [];
      for (const item of items) {
        snapshots.push(await transaction.get(doc(db, 'posts', item.id)));
      }

      snapshots.forEach((snapshot, index) => {
        const item = items[index];
        if (!snapshot.exists()) {
          throw new Error(`"${item.meal}" artık yayında değil.`);
        }
        const data = snapshot.data();
        if (data.sellerId === currentUser.uid) {
          throw new Error(`"${item.meal}" sizin ilanınız.`);
        }
        const stock = Number(data.stock) || 0;
        if (stock < item.quantity) {
          throw new Error(`"${item.meal}" için yeterli stok yok. Kalan: ${stock}.`);
        }
      });

      snapshots.forEach((snapshot, index) => {
        const item = items[index];
        const stock = Number(snapshot.data().stock) || 0;
        transaction.update(snapshot.ref, { stock: stock - item.quantity });
      });

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryTotal = items.reduce((sum, item) => sum + (Number(item.deliveryFee) || 0), 0);

      transaction.set(doc(collection(db, 'orders')), {
        userId: currentUser.uid,
        items: items.map((item) => ({
          postId: item.id,
          meal: item.meal,
          price: item.price,
          quantity: item.quantity,
          deliveryFee: Number(item.deliveryFee) || 0,
          sellerId: item.sellerId || '',
          sellerName: item.sellerName || '',
        })),
        subtotal,
        deliveryTotal,
        total: subtotal + deliveryTotal,
        status: 'alındı',
        createdAt: serverTimestamp(),
      });
    });

    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
