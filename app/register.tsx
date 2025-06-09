import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'react-native';
import { TextInput } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { authService } from '@/services/authService';

// Colors extracted from Altura logo
const COLORS = {
  primary: '#6366f1', // Purple from the logo
  secondary: '#818cf8', // Lighter purple
  accent: '#4f46e5', // Darker purple
  background: '#f8f9fa',
  white: '#fff',
  text: '#2d3436',
  textSecondary: '#636e72',
  inputBg: '#f8f9fa',
  inputBorder: '#e9ecef',
}

export default function RegisterScreen() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullname || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan konfirmasi password tidak cocok');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        fullname,
        email,
        password,
        phone,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.topSection}>
          <Image 
            source={require('../assets/images/logo.png')}
            style={styles.logo}
          />
          
          <ThemedText type="title" style={styles.title}>Altura</ThemedText>
          
          <ThemedText style={styles.subtitle}>
            Teman Setia Wirausaha
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.formSection}>
          <ThemedView style={styles.formContainer}>
            <ThemedText style={styles.welcomeText}>Daftar Akun</ThemedText>
            <ThemedText style={styles.subWelcome}>Buat akun baru untuk perusahaan Anda</ThemedText>
    
            <ThemedView style={styles.inputContainer}>
              <TextInput
                placeholder="Nama Lengkap"
                style={styles.input}
                placeholderTextColor={COLORS.textSecondary}
                value={fullname}
                onChangeText={setFullname}
              />
              
              <TextInput
                placeholder="Email"
                style={styles.input}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              
              <TextInput
                placeholder="Nomor Telepon"
                style={styles.input}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              
              <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
              />
              
              <TextInput
                placeholder="Konfirmasi Password"
                secureTextEntry
                style={styles.input}
                placeholderTextColor={COLORS.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </ThemedView>
    
            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <ThemedText style={styles.registerButtonText}>
                {loading ? 'Memproses...' : 'Daftar'}
              </ThemedText>
            </TouchableOpacity>

            <ThemedView style={styles.loginContainer}>
              <ThemedText style={styles.loginText}>Sudah punya akun? </ThemedText>
              <TouchableOpacity onPress={handleBackToLogin}>
                <ThemedText style={styles.loginLink}>Masuk</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.colorAccents}>
              <ThemedView style={[styles.colorDot, { backgroundColor: COLORS.secondary }]} />
              <ThemedView style={[styles.colorLine, { backgroundColor: COLORS.accent }]} />
              <ThemedView style={[styles.colorLine, { backgroundColor: COLORS.accent }]} />
              <ThemedView style={[styles.colorLine, { backgroundColor: COLORS.secondary }]} />
              <ThemedView style={[styles.colorDot, { backgroundColor: COLORS.primary }]} />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 7,
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
  },
  subWelcome: {
    color: COLORS.textSecondary,
    marginBottom: 25,
    fontSize: 16,
  },
  inputContainer: {
    gap: 15,
    marginBottom: 25,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Decorative elements to match logo style
  colorAccents: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    height: 20,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 3,
  },
  colorLine: {
    width: 6,
    height: 20,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});