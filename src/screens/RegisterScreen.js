import React, { useState } from 'react';
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
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toUserMessage } from '../utils/helpers';

const RegisterScreen = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    const trimmedName = fullName.trim();
    const ageNumber = parseInt(age, 10);

    if (!trimmedName || !age || !gender || !email.trim() || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (!Number.isInteger(ageNumber) || ageNumber < 1 || ageNumber > 120) {
      Alert.alert('Hata', 'Geçerli bir yaş girin.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }

    setSubmitting(true);
    let credential;
    try {
      credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setSubmitting(false);
      Alert.alert('Kayıt hatası', toUserMessage(error));
      return;
    }

    try {
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        fullName: trimmedName,
        age: ageNumber,
        gender,
        email: email.trim(),
        createdAt: new Date().toISOString(),
      });
      await refreshProfile(credential.user.uid);
      Alert.alert('Başarılı', 'Hesabınız oluşturuldu.');
    } catch (error) {
      Alert.alert('Profil kaydedilemedi', toUserMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Kayıt Ol</Text>

        <TextInput placeholder="İsim Soyisim" value={fullName} onChangeText={setFullName} style={styles.input} />
        <TextInput
          placeholder="Yaş"
          value={age}
          onChangeText={setAge}
          style={styles.input}
          keyboardType="number-pad"
        />

        <View style={styles.pickerContainer}>
          <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker}>
            <Picker.Item label="Cinsiyet seçiniz" value="" enabled={false} />
            <Picker.Item label="Erkek" value="erkek" />
            <Picker.Item label="Kadın" value="kadın" />
          </Picker>
        </View>

        <TextInput
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
        </TouchableOpacity>
        <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
          Zaten hesabın var mı? Giriş yap
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: { height: Platform.OS === 'ios' ? 160 : 50 },
  button: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 16, color: '#1565c0', textAlign: 'center', marginBottom: 20 },
});

export default RegisterScreen;
