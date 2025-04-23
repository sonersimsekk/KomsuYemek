import { useContext } from 'react';
import { PostContext } from '../context/PostContext';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

const PostScreen = () => {
  const { addPost } = useContext(PostContext);
  const navigation = useNavigation();

  const [meal, setMeal] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamerayı kullanabilmek için izin vermelisiniz.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!meal || !stock || !price) {
      Alert.alert('Eksik Bilgi', 'Lütfen yemek adı, stok ve fiyat girin.');
      return;
    }
  
    const ilan = {
      meal,
      stock,
      price,
      deliveryFee,
      description,
      image,
      date: new Date().toLocaleString(),
    };
  
    addPost(ilan);
  
    console.log('Yeni ilan:', ilan);
    Alert.alert('✅ Başarılı', 'İlan başarıyla oluşturuldu.');
    navigation.goBack('Home') // burayı değiştirmeyi unutma

    setMeal('');
    setStock('');
    setPrice('');
    setDeliveryFee('');
    setDescription('');
    setImage(null);
  };  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>🍽️ Yemek Adı</Text>
      <TextInput style={styles.input} value={meal} onChangeText={setMeal} placeholder="Örn: Patatesli Köfte" />

      <Text style={styles.label}>📦 Stok (tabak sayısı)</Text>
      <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Örn: 3" />

      <Text style={styles.label}>💸 Fiyat (TL)</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Örn: 40" />

      <Text style={styles.label}>🚚 Teslimat Ücreti</Text>
      <TextInput style={styles.input} value={deliveryFee} onChangeText={setDeliveryFee} keyboardType="numeric" placeholder="Örn: 10" />

      <Text style={styles.label}>📝 Açıklama</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={description} onChangeText={setDescription} placeholder="Ek bilgi..." />

      <Text style={styles.label}>📷 Yemek Fotoğrafı</Text>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <View style={styles.buttonGroup}>
        <Button title="Galeriden Seç" onPress={pickImageFromLibrary} />
        <View style={{ width: 10 }} />
        <Button title="Kamera ile Çek" onPress={takePhotoWithCamera} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="✅ İlanı Yayınla" onPress={handleSubmit} color="#4CAF50" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  }
});

export default PostScreen;
