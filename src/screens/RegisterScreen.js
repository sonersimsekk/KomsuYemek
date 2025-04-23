import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!fullName || !age || !gender || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        age,
        gender,
        email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Başarılı', 'Kayıt başarılı!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Kayıt Hatası', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput placeholder="İsim Soyisim" value={fullName} onChangeText={setFullName} style={styles.input} />
      <TextInput placeholder="Yaş" value={age} onChangeText={setAge} style={styles.input} keyboardType="numeric" />
      
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
        >
          <Picker.Item label="Cinsiyet Seçiniz" value="" enabled={false} />
          <Picker.Item label="Erkek" value="erkek" />
          <Picker.Item label="Kadın" value="kadın" />
        </Picker>
      </View>

      <TextInput placeholder="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <Button title="Kayıt Ol" onPress={handleRegister} color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15 },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15 },
});

export default RegisterScreen;