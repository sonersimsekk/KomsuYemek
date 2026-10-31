import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from './src/context/CartContext';
import { useAuth } from './src/context/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import PostScreen from './src/screens/PostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CartScreen from './src/screens/CartScreen';

const Stack = createNativeStackNavigator();

function HomeHeaderActions({ navigation }) {
  const { cartCount } = useContext(CartContext);

  return (
    <View style={styles.headerActions}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Post')}
        style={styles.headerButton}
        accessibilityLabel="İlan ver"
      >
        <Ionicons name="add-circle-outline" size={28} color="#2E7D32" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Cart')}
        style={styles.headerButton}
        accessibilityLabel="Sepet"
      >
        <Ionicons name="cart-outline" size={26} color="#333" />
        {cartCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} accessibilityLabel="Profil">
        <Ionicons name="person-circle-outline" size={28} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const screenOptions = {
  headerStyle: { backgroundColor: '#fff' },
  headerTintColor: '#1b5e20',
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: '#f4f6f5' },
};

const AppNavigator = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.bootText}>Komşu Yemek</Text>
      </View>
    );
  }

  return (
    <NavigationContainer key={user ? user.uid : 'guest'}>
      <Stack.Navigator screenOptions={screenOptions}>
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                headerTitle: 'Yemekler',
                headerBackVisible: false,
                headerRight: () => <HomeHeaderActions navigation={navigation} />,
              })}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Sepet' }} />
            <Stack.Screen name="Post" component={PostScreen} options={{ title: 'İlan Ver' }} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'İlan Detayı' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş Yap' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Kayıt Ol' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6f5',
  },
  bootText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e20',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  headerButton: {
    marginRight: 14,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#E53935',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default AppNavigator;
