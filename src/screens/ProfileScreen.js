import React, { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PostContext } from '../context/PostContext';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatTimestamp, labelGender, toUserMessage } from '../utils/helpers';

const ProfileScreen = () => {
  const { user, profile, profileLoading } = useAuth();
  const { posts, deletePost } = useContext(PostContext);
  const { removeFromCart } = useContext(CartContext);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!user) return undefined;

    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setOrders(list);
        setOrdersError('');
      },
      (error) => {
        console.error('Siparişler alınamadı:', error);
        setOrdersError(toUserMessage(error));
      }
    );

    return unsubscribe;
  }, [user]);

  const myPosts = posts.filter((post) => post.sellerId === user?.uid);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Çıkış yapılamadı', toUserMessage(error));
    }
  };

  const handleDelete = (post) => {
    Alert.alert('İlanı sil', `"${post.meal}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post.id);
            removeFromCart(post.id);
          } catch (error) {
            Alert.alert('Silinemedi', toUserMessage(error));
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profilim</Text>
      {profileLoading ? <Text style={styles.hint}>Yükleniyor...</Text> : null}
      {profile ? (
        <View style={styles.card}>
          <Text style={styles.info}>İsim: {profile.fullName}</Text>
          <Text style={styles.info}>Yaş: {profile.age}</Text>
          <Text style={styles.info}>Cinsiyet: {labelGender(profile.gender)}</Text>
          <Text style={styles.info}>E-posta: {profile.email}</Text>
        </View>
      ) : !profileLoading ? (
        <View style={styles.card}>
          <Text style={styles.info}>E-posta: {user?.email}</Text>
          <Text style={styles.hint}>Profil kaydı bulunamadı.</Text>
        </View>
      ) : null}

      <Text style={styles.section}>İlanlarım</Text>
      {myPosts.length === 0 ? <Text style={styles.hint}>Henüz ilanınız yok.</Text> : null}
      {myPosts.map((post) => (
        <View key={post.id} style={styles.card}>
          <Text style={styles.meal}>{post.meal}</Text>
          <Text style={styles.meta}>
            {formatPrice(post.price)} · Stok: {post.stock}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(post)}>
            <Text style={styles.delete}>Sil</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.section}>Siparişlerim</Text>
      {ordersError ? <Text style={styles.error}>{ordersError}</Text> : null}
      {orders.length === 0 && !ordersError ? <Text style={styles.hint}>Henüz siparişiniz yok.</Text> : null}
      {orders.map((order) => (
        <View key={order.id} style={styles.card}>
          <Text style={styles.meal}>{formatPrice(order.total)}</Text>
          <Text style={styles.meta}>{formatTimestamp(order.createdAt)} · {order.status}</Text>
          {(order.items || []).map((item, index) => (
            <Text key={`${order.id}-${index}`} style={styles.meta}>
              {item.quantity} x {item.meal}
              {item.sellerName ? ` (${item.sellerName})` : ''}
            </Text>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  section: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 6 },
  meal: { fontWeight: '700', fontSize: 16 },
  meta: { color: '#555', marginTop: 4 },
  hint: { color: '#777' },
  error: { color: '#c62828', marginBottom: 8 },
  delete: { color: '#c62828', fontWeight: '700', marginTop: 8 },
  logout: {
    marginTop: 28,
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: '700' },
});

export default ProfileScreen;
