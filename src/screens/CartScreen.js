import React, { useContext, useRef, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartContext } from '../context/CartContext';
import { PostContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, toUserMessage } from '../utils/helpers';

const CartScreen = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, placeOrder } = useContext(CartContext);
  const { posts } = useContext(PostContext);
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const rows = cartItems.map((item) => {
    const post = posts.find((entry) => entry.id === item.id);
    let issue = '';
    if (!post) issue = 'Bu ilan artık yayında değil.';
    else if (post.sellerId === user?.uid) issue = 'Kendi ilanınızı sipariş edemezsiniz.';
    else if (Number(post.stock) < item.quantity) issue = `Stok yetersiz. Kalan: ${post.stock}.`;
    return { item, post, issue };
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryTotal = cartItems.reduce((sum, item) => sum + (Number(item.deliveryFee) || 0), 0);
  const blocked = rows.some((row) => row.issue);

  const handleCheckout = () => {
    if (submittingRef.current || blocked) return;
    Alert.alert('Siparişi tamamla', `Toplam ${formatPrice(subtotal + deliveryTotal)} tutarında sipariş verilsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Onayla',
        onPress: async () => {
          if (submittingRef.current) return;
          submittingRef.current = true;
          setSubmitting(true);
          try {
            await placeOrder();
            Alert.alert('Sipariş alındı', 'Siparişiniz kaydedildi. Profilinizden görebilirsiniz.');
          } catch (error) {
            Alert.alert('Sipariş tamamlanamadı', toUserMessage(error));
          } finally {
            submittingRef.current = false;
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Sepetiniz boş.</Text>}
        renderItem={({ item: row }) => {
          const { item, post, issue } = row;
          const stock = post ? Number(post.stock) : item.stock;
          return (
            <View style={styles.card}>
              {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
              <View style={styles.info}>
                <Text style={styles.meal}>{item.meal}</Text>
                <Text style={styles.meta}>{formatPrice(item.price)} / tabak</Text>
                {Number(item.deliveryFee) > 0 ? (
                  <Text style={styles.meta}>Teslimat: {formatPrice(item.deliveryFee)}</Text>
                ) : null}
                {issue ? <Text style={styles.issue}>{issue}</Text> : null}
                <View style={styles.quantityRow}>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, item.quantity - 1, stock)}>
                    <Text style={styles.qtyText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, item.quantity + 1, stock)}>
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.remove}>Kaldır</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {cartItems.length > 0 ? (
        <View style={styles.footer}>
          <Text style={styles.note}>Teslimat ücreti her ilan için bir kez eklenir.</Text>
          <Text style={styles.totalLine}>Ara toplam: {formatPrice(subtotal)}</Text>
          <Text style={styles.totalLine}>Teslimat: {formatPrice(deliveryTotal)}</Text>
          <Text style={styles.total}>Toplam: {formatPrice(subtotal + deliveryTotal)}</Text>
          <TouchableOpacity
            style={[styles.button, (blocked || submitting) && styles.buttonDisabled]}
            onPress={handleCheckout}
            disabled={blocked || submitting}
          >
            <Text style={styles.buttonText}>{submitting ? 'Gönderiliyor...' : 'Siparişi tamamla'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={clearCart} disabled={submitting}>
            <Text style={styles.clearText}>Sepeti temizle</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, flexGrow: 1 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  image: { width: 72, height: 72, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  meal: { fontWeight: '700', fontSize: 16 },
  meta: { color: '#555', marginTop: 2 },
  issue: { color: '#c62828', marginTop: 6 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 18, fontWeight: '700' },
  quantity: { marginHorizontal: 12, fontWeight: '700' },
  remove: { marginLeft: 12, color: '#c62828', fontWeight: '700' },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  note: { color: '#777', marginBottom: 8, fontSize: 12 },
  totalLine: { color: '#333', marginBottom: 2 },
  total: { fontSize: 18, fontWeight: '800', marginVertical: 8 },
  button: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700' },
  clearButton: { alignItems: 'center', paddingVertical: 12 },
  clearText: { color: '#E53935', fontWeight: '700' },
});

export default CartScreen;
