import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { CommonActions } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error('Veri alınırken hata:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profilim</Text>
      {userData ? (
        <>
          <Text style={styles.info}>📛 İsim Soyisim: {userData.fullName}</Text>
          <Text style={styles.info}>🎂 Yaş: {userData.age}</Text>
          <Text style={styles.info}>🚻 Cinsiyet: {userData.gender}</Text>
          <Text style={styles.info}>📧 Email: {userData.email}</Text>
        </>
      ) : (
        <Text>Yükleniyor...</Text>
      )}
      <View style={{ marginTop: 30 }}>
        <Button title="Çıkış Yap" onPress={handleLogout} color="#E53935" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  info: { fontSize: 16, marginBottom: 10 },
});

export default ProfileScreen;