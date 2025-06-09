import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { user } = useAuth();
  console.log('Index page - User status:', user ? 'Logged in' : 'Not logged in');
  
  if (!user) {
    console.log('Redirecting to login from index...');
    return <Redirect href="/login" />;
  }
  
  console.log('Redirecting to tabs from index...');
  return <Redirect href="/(tabs)" />;
}