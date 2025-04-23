import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Button, TouchableOpacity } from 'react-native';
import { PostContext } from '../context/PostContext';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { posts } = useContext(PostContext);

  const goToDetail = (post) => {
    navigation.navigate('PostDetail', { post });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {
        posts.length === 0 ? (
          <Text style={styles.empty}>Henüz ilan yok.</Text>
        ) : (
          posts.map((post, index) => (
            <TouchableOpacity key={index} onPress={() => goToDetail(post)} activeOpacity={0.8}>
              <View style={styles.card}>
                {post.image && <Image source={{ uri: post.image }} style={styles.image} />}
                <Text style={styles.title}>{post.meal}</Text>
                <Text>Stok: {post.stock} tabak</Text>
                <Text>Fiyat: {post.price} TL</Text>
                {post.deliveryFee && <Text>Teslimat Ücreti: {post.deliveryFee} TL</Text>}
                {post.description ? <Text>Açıklama: {post.description}</Text> : null}
                <Text style={styles.date}>{post.date}</Text>
              </View>
            </TouchableOpacity>
          ))
        )
      }

      <View style={styles.buttonContainer}>
        <Button
          title="🍳 İlan Ver"
          onPress={() => navigation.navigate('Post')}
          color="#4CAF50"
        />
      </View>
    </ScrollView >
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
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
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  date: {
    marginTop: 10,
    color: '#888',
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default HomeScreen;