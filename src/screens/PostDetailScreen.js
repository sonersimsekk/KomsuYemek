import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, Button, Alert, Keyboard } from 'react-native';
import { PostContext } from '../context/PostContext';
// import { CartContext } from '../context/CartContext';

const PostDetailScreen = ({ route }) => {
  const { post } = route.params;
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('');
  const [username, setUsername] = useState('');
  const { posts, setPosts } = useContext(PostContext);
  // const { addToCart } = useContext(CartContext);

  const addFeedback = () => {
    if (!username || !comment || !rating) {
      Alert.alert('Eksik Bilgi', 'Lütfen isim, yorum ve puan girin.');
      return;
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      Alert.alert('Geçersiz Puan', 'Puan 1 ile 5 arasında bir sayı olmalıdır.');
      return;
    }

    const newComment = {
      user: username,
      text: comment,
      date: new Date().toLocaleString('tr-TR'),
    };

    const updatedPosts = posts.map((p) => {
      if (p.date === post.date) {
        return {
          ...p,
          comments: [...(p.comments || []), newComment],
          ratings: [...(p.ratings || []), numericRating],
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    setUsername('');
    setComment('');
    setRating('');
    Keyboard.dismiss();
    Alert.alert('Teşekkürler!', 'Yorum ve puan eklendi.');
  };

  const currentPost = posts.find((p) => p.date === post.date) || post;

  const ratings = Array.isArray(currentPost.ratings) ? currentPost.ratings : [];
  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
      : null;

  const renderStars = (rating) => {
    const safeRating = Math.max(0, Math.min(5, Math.floor(Number(rating))));
    return '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {currentPost.image && <Image source={{ uri: currentPost.image }} style={styles.image} />}
      <Text style={styles.title}>{currentPost.meal}</Text>
      <Text>Stok: {currentPost.stock} tabak</Text>
      <Text>Fiyat: {currentPost.price} TL</Text>
      {currentPost.deliveryFee && <Text>Teslimat Ücreti: {currentPost.deliveryFee} TL</Text>}
      {currentPost.description && <Text>Açıklama: {currentPost.description}</Text>}
      <Text style={styles.date}>{currentPost.date}</Text>

      {/* <Button title="Sepete Ekle" onPress={() => addToCart(post)} /> */}

      {averageRating ? (
        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>⭐ Ortalama Puan: {averageRating}</Text>
          <Text style={{ fontSize: 22 }}>{renderStars(averageRating)}</Text>
        </View>
      ) : (
        <Text style={{ marginVertical: 10, color: '#888' }}>Henüz puan yok</Text>
      )}

      <Text style={styles.label}>👤 İsim</Text>
      <TextInput
        style={styles.input}
        placeholder="Adınız"
        value={username}
        onChangeText={setUsername}
      />

      <View style={styles.feedbackContainer}>
        <Text style={styles.label}>Yorum Yaz:</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          style={styles.input}
          placeholder="Yorumunuzu yazın"
        />

        <Text style={styles.label}>Puan (1-5):</Text>
        <TextInput
          value={rating}
          onChangeText={setRating}
          style={styles.input}
          placeholder="5"
          keyboardType="numeric"
        />

        <Button title="Yorumu Gönder" onPress={addFeedback} color="#4CAF50" />
      </View>

      <View style={styles.commentList}>
        <Text style={styles.commentTitle}>Yorumlar:</Text>
        {(currentPost.comments || []).map((c, i) => (
          <View key={i} style={styles.commentBox}>
            <Text style={styles.commentUser}>{c.user} ({c.date}):</Text>
            <Text style={styles.commentText}>{c.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 10,
  },
  date: {
    color: '#888',
    marginTop: 5,
    fontSize: 12,
  },
  rating: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 30,
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
  },
  commentList: {
    marginTop: 30,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentBox: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#444',
  },
  commentText: {
    marginTop: 3,
    fontSize: 14,
  },
});

export default PostDetailScreen;