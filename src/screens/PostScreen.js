import React, { useContext, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PostContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { displayNameOf, parseAmount, toUserMessage } from '../utils/helpers';

const PostScreen = () => {
  const { addPost } = useContext(PostContext);
  const { user, profile } = useAuth();
  const navigation = useNavigation();
  const submittingRef = useRef(false);

  const [meal, setMeal] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submittingRef.current) return;

    const stockNumber = parseInt(stock, 10);
    const priceNumber = parseAmount(price);
    const feeNumber = deliveryFee.trim() === '' ? 0 : parseAmount(deliveryFee);

    if (!meal.trim() || !stock.trim() || !price.trim()) {
      Alert.alert('Eksik bilgi', 'Lütfen yemek adı, stok ve fiyat girin.');
      return;
    }
    if (!Number.isInteger(stockNumber) || stockNumber < 1) {
      Alert.alert('Geçersiz stok', 'Stok en az 1 tabak olmalı.');
      return;
    }
    if (!(priceNumber > 0)) {
      Alert.alert('Geçersiz fiyat', 'Fiyat 0’dan büyük olmalı.');
      return;
    }
    if (Number.isNaN(feeNumber) || feeNumber < 0) {
      Alert.alert('Geçersiz teslimat ücreti', 'Teslimat ücreti negatif olamaz.');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await addPost({
        meal: meal.trim(),
        stock: stockNumber,
        price: priceNumber,
        deliveryFee: feeNumber,
        description: description.trim(),
        image: null,
        sellerName: displayNameOf(profile, user),
      });

      Alert.alert('Başarılı', 'İlan yayınlandı.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('İlan yayınlanamadı', toUserMessage(error));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Yemek adı</Text>
        <TextInput style={styles.input} value={meal} onChangeText={setMeal} placeholder="Örn: Patatesli köfte" />

        <Text style={styles.label}>Stok (tabak)</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
          placeholder="Örn: 3"
        />

        <Text style={styles.label}>Fiyat (TL)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="Örn: 40"
        />

        <Text style={styles.label}>Teslimat ücreti (TL)</Text>
        <TextInput
          style={styles.input}
          value={deliveryFee}
          onChangeText={setDeliveryFee}
          keyboardType="decimal-pad"
          placeholder="Boş bırakılırsa 0"
        />

        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Ek bilgi"
        />

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>İlanı yayınla</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multiline: { height: 80, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default PostScreen;
