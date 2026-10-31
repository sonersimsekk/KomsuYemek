import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { PostProvider } from './src/context/PostContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PostProvider>
          <CartProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </CartProvider>
        </PostProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
