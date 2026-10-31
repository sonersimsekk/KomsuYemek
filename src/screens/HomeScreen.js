import React, { useContext } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PostContext } from '../context/PostContext';
import { averageRating, formatPrice, formatTimestamp, renderStars } from '../utils/helpers';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { posts, loading, error } = useContext(PostContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error && posts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.empty}>Henüz ilan yok.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Post')}>
            <Text style={styles.buttonText}>İlan Ver</Text>
          </TouchableOpacity>
        </View>
      ) : (
        posts.map((post) => {
          const rating = averageRating(post);
          const outOfStock = Number(post.stock) <= 0;
          return (
            <TouchableOpacity
              key={post.id}
              onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
              activeOpacity={0.8}
            >
              <View style={styles.card}>
                {post.image ? <Image source={{ uri: post.image }} style={styles.image} /> : null}
                <Text style={styles.title}>{post.meal}</Text>
                <Text style={styles.seller}>{post.sellerName || 'Komşu'}</Text>
                <Text style={outOfStock ? styles.outOfStock : styles.meta}>
                  {outOfStock ? 'Tükendi' : `Stok: ${post.stock} tabak`}
                </Text>
                <Text style={styles.meta}>Fiyat: {formatPrice(post.price)}</Text>
                {Number(post.deliveryFee) > 0 ? (
                  <Text style={styles.meta}>Teslimat: {formatPrice(post.deliveryFee)}</Text>
                ) : null}
                {post.description ? <Text style={styles.description}>{post.description}</Text> : null}
                <Text style={styles.rating}>
                  {rating == null ? 'Henüz puan yok' : `${renderStars(rating)} ${rating.toFixed(1)}`}
                </Text>
                <Text style={styles.date}>{formatTimestamp(post.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  loader: { marginTop: 24 },
  error: { color: '#c62828', textAlign: 'center', marginBottom: 12 },
  emptyBox: { alignItems: 'center', marginTop: 48 },
  empty: { textAlign: 'center', fontSize: 16, color: '#888', marginBottom: 16 },
  button: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20 },
  buttonText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
  seller: { color: '#2E7D32', marginBottom: 6 },
  meta: { color: '#333', marginBottom: 2 },
  outOfStock: { color: '#c62828', fontWeight: '700', marginBottom: 2 },
  description: { marginTop: 6, color: '#444' },
  rating: { marginTop: 8, color: '#f9a825', fontWeight: '700' },
  date: { marginTop: 8, color: '#888', fontSize: 12 },
});

export default HomeScreen;
