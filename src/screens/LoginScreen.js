import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Giriş Yap" onPress={handleLogin} />
      <Text onPress={() => navigation.navigate('Register')} style={styles.link}>Hesabın yok mu? Kayıt ol</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: { borderWidth: 1, padding: 10, marginVertical: 5 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  error: { color: 'red' },
  link: { marginTop: 10, color: 'blue', textAlign: 'center' }
});
