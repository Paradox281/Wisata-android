import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (!loaded) return;
    
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    console.log('Current segments:', segments);
    console.log('User status:', user ? 'Logged in' : 'Not logged in');
    console.log('In auth group:', inAuthGroup);
    
    if (!user && !inAuthGroup) {
      // Redirect ke login jika user belum login
      console.log('Redirecting to login...');
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect ke tabs jika user sudah login
      console.log('Redirecting to tabs...');
      router.replace('/(tabs)');
    }
    
    setIsReady(true);
  }, [user, segments, loaded]);

  if (!loaded || !isReady) {
    return <Slot />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="booking" options={{ headerShown: true, title: 'Formulir Booking' }} />
        <Stack.Screen name="detail/[id]" options={{ headerShown: true, title: 'Detail Destinasi' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
