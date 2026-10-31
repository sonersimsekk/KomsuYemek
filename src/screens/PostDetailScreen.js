import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CartContext } from '../context/CartContext';
import { PostContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { averageRating, displayNameOf, formatPrice, formatTimestamp, renderStars, toUserMessage } from '../utils/helpers';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { posts, loading, addCommentAndRating, deletePost } = useContext(PostContext);
  const { addToCart, removeFromCart } = useContext(CartContext);
  const { user, profile } = useAuth();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const currentPost = posts.find((post) => post.id === postId);
  const stock = Number(currentPost?.stock) || 0;

  useEffect(() => {
    if (stock < 1) return;
    setQuantity((value) => Math.max(1, Math.min(value, stock)));
  }, [stock]);

  if (loading && !currentPost) {
    return (
      <View style={styles.missing}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!currentPost) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Bu ilan artık yayında değil.</Text>
      </View>
    );
  }

  const isOwner = currentPost.sellerId === user?.uid;
  const avg = averageRating(currentPost);
  const alreadyCommented = (currentPost.comments || []).some((item) => item.userId === user?.uid);

  const handleAddToCart = () => {
    const added = addToCart({
      id: currentPost.id,
      meal: currentPost.meal,
      price: Number(currentPost.price) || 0,
      deliveryFee: Number(currentPost.deliveryFee) || 0,
      image: currentPost.image || null,
      stock,
      quantity,
      sellerId: currentPost.sellerId,
      sellerName: currentPost.sellerName || '',
    });

    if (!added) {
      Alert.alert('Eklenemedi', 'Stok bu kadar tabağa yetmiyor.');
      return;
    }
    Alert.alert('Sepete eklendi', `${quantity} tabak sepete eklendi.`);
  };

  const handleDelete = () => {
    Alert.alert('İlanı sil', `"${currentPost.meal}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(currentPost.id);
            removeFromCart(currentPost.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Silinemedi', toUserMessage(error));
          }
        },
      },
    ]);
  };

  const addFeedback = async () => {
    if (sending) return;
    if (!comment.trim() || rating < 1) {
      Alert.alert('Eksik bilgi', 'Yorum yazın ve 1 ile 5 arasında puan verin.');
      return;
    }
    if (alreadyCommented) {
      Alert.alert('Zaten yorum yaptınız', 'Bu ilan için bir yorumunuz var.');
      return;
    }

    setSending(true);
    try {
      await addCommentAndRating(currentPost.id, {
        id: `${Date.now()}_${user.uid}`,
        userId: user.uid,
        user: displayNameOf(profile, user),
        text: comment.trim(),
        rating,
        date: new Date().toLocaleString('tr-TR'),
      });
      setComment('');
      setRating(0);
      Keyboard.dismiss();
      Alert.alert('Teşekkürler', 'Yorum ve puan eklendi.');
    } catch (error) {
      Alert.alert('Gönderilemedi', toUserMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {currentPost.image ? <Image source={{ uri: currentPost.image }} style={styles.image} /> : null}
      <Text style={styles.title}>{currentPost.meal}</Text>
      <Text style={styles.seller}>{currentPost.sellerName || 'Komşu'}</Text>
      <Text>Stok: {stock} tabak</Text>
      <Text>Fiyat: {formatPrice(currentPost.price)}</Text>
      {Number(currentPost.deliveryFee) > 0 ? <Text>Teslimat: {formatPrice(currentPost.deliveryFee)}</Text> : null}
      {currentPost.description ? <Text style={styles.description}>{currentPost.description}</Text> : null}
      <Text style={styles.date}>{formatTimestamp(currentPost.createdAt)}</Text>

      <View style={styles.ratingBox}>
        <Text style={styles.sectionTitle}>
          {avg == null ? 'Henüz puan yok' : `Ortalama puan: ${avg.toFixed(1)}`}
        </Text>
        {avg != null ? <Text style={styles.stars}>{renderStars(avg)}</Text> : null}
      </View>

      {isOwner ? (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>İlanı sil</Text>
        </TouchableOpacity>
      ) : stock < 1 ? (
        <Text style={styles.outOfStock}>Bu yemek tükendi.</Text>
      ) : (
        <View style={styles.cartBox}>
          <Text style={styles.sectionTitle}>Sepete ekle</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity((value) => Math.min(stock, value + 1))}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleAddToCart}>
            <Text style={styles.primaryText}>Sepete ekle</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Yorum yaz</Text>
      {alreadyCommented ? (
        <Text style={styles.hint}>Bu ilanı zaten puanladınız.</Text>
      ) : (
        <View>
          <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => setRating(value)}>
                <Text style={[styles.pickerStar, value <= rating && styles.pickerStarOn]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            style={styles.input}
            placeholder="Yorumunuz"
            multiline
          />
          <TouchableOpacity
            style={[styles.primaryButton, sending && styles.buttonDisabled]}
            onPress={addFeedback}
            disabled={sending}
          >
            <Text style={styles.primaryText}>{sending ? 'Gönderiliyor...' : 'Yorumu gönder'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Yorumlar</Text>
      {(currentPost.comments || []).length === 0 ? <Text style={styles.hint}>Henüz yorum yok.</Text> : null}
      {(currentPost.comments || []).map((item) => (
        <View key={item.id || `${item.userId}-${item.date}`} style={styles.commentBox}>
          <Text style={styles.commentUser}>
            {item.user} · {renderStars(item.rating)}
          </Text>
          <Text style={styles.commentDate}>{item.date}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missingText: { fontSize: 16, color: '#666' },
  image: { width: '100%', height: 220, borderRadius: 10, marginBottom: 10 },
  title: { fontWeight: 'bold', fontSize: 22, marginBottom: 4 },
  seller: { color: '#2E7D32', marginBottom: 8 },
  description: { marginTop: 8 },
  date: { color: '#888', marginTop: 6, fontSize: 12 },
  ratingBox: { marginTop: 16 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginTop: 18, marginBottom: 8 },
  stars: { fontSize: 22, color: '#f9a825' },
  cartBox: { marginTop: 8 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 20, fontWeight: '700' },
  quantity: { marginHorizontal: 16, fontSize: 18, fontWeight: '700' },
  primaryButton: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  buttonDisabled: { opacity: 0.7 },
  deleteButton: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: { color: '#E53935', fontWeight: '700' },
  outOfStock: { marginTop: 16, color: '#c62828', fontWeight: '700' },
  hint: { color: '#777' },
  starPicker: { flexDirection: 'row', marginBottom: 8 },
  pickerStar: { fontSize: 32, color: '#ccc', marginRight: 6 },
  pickerStarOn: { color: '#f9a825' },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  commentBox: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10 },
  commentUser: { fontWeight: '700', color: '#444' },
  commentDate: { color: '#888', fontSize: 12, marginTop: 2 },
  commentText: { marginTop: 4 },
});

export default PostDetailScreen;
