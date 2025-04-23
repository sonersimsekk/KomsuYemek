// import React, { useContext } from 'react';
// import { View, Text, Button, FlatList } from 'react-native';
// import { CartContext } from '../context/CartContext';

// const CartScreen = ({ navigation }) => {
//   const { cartItems, removeFromCart, clearCart } = useContext(CartContext);

//   return (
//     <View style={{ padding: 20 }}>
//       <Text style={{ fontSize: 20, fontWeight: 'bold' }}>🛒 Sepetim</Text>
//       {cartItems.length === 0 ? (
//         <Text>Sepetiniz boş.</Text>
//       ) : (
//         <>
//           <FlatList
//             data={cartItems}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={({ item, index }) => (
//               <View style={{ marginVertical: 10 }}>
//                 <Text>{item.meal} - {item.price} TL</Text>
//                 <Button title="Kaldır" onPress={() => removeFromCart(index)} />
//               </View>
//             )}
//           />
//           <Button title="Sepeti Temizle" onPress={clearCart} />
//         </>
//       )}
//     </View>
//   );
// };

// export default CartScreen;