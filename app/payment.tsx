import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../services/api';
import { authService } from '../services/authService'; // pastikan path sesuai

const COLORS = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  secondary: '#4f46e5',
  accent: '#c4b5fd',
  background: '#f8f9fa',
  white: '#fff',
  text: '#2d3436',
  textSecondary: '#636e72',
  border: '#e9ecef',
};

const bankList = [
  { label: 'Bank BCA', value: 'BCA', rekening: '1234567890' },
  { label: 'Bank Mandiri', value: 'MANDIRI', rekening: '9876543210' },
  { label: 'Bank BRI', value: 'BRI', rekening: '1122334455' },
  { label: 'Bank BNI', value: 'BNI', rekening: '5566778899' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const { bookingId: bookingIdParam } = useLocalSearchParams();
  // bookingIdParam bisa number/string/undefined, pastikan string
  const initialBookingId = bookingIdParam !== undefined && bookingIdParam !== null ? String(bookingIdParam) : '';
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [selectedBank, setSelectedBank] = useState('BNI');
  const [buktiPembayaran, setBuktiPembayaran] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const rekening = bankList.find(b => b.value === selectedBank)?.rekening || '';

  const handleCopyRekening = async () => {
    await Clipboard.setStringAsync(rekening);
    Alert.alert('Disalin', 'Nomor rekening berhasil disalin');
  };

  const handleUploadBukti = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Izin galeri dibutuhkan');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      let asset = result.assets[0];
      let fileUri = asset.uri;
      // Jika uri content://, copy ke file://
      if (fileUri.startsWith('content://')) {
        const fileName = asset.fileName || 'bukti.jpg';
        const newPath = FileSystem.cacheDirectory + fileName;
        await FileSystem.copyAsync({ from: fileUri, to: newPath });
        fileUri = newPath;
      }
      setBuktiPembayaran({
        ...asset,
        uri: fileUri,
      });
    }
  };

  const handleKirimPembayaran = async () => {
    if (!bookingId) {
      Alert.alert('Error', 'Booking ID wajib diisi');
      return;
    }
    if (!buktiPembayaran || !buktiPembayaran.uri) {
      Alert.alert('Error', 'Bukti pembayaran wajib diupload');
      return;
    }
    setLoading(true);
    try {
      // Pastikan uri file valid (file://)
      let fileUri = buktiPembayaran.uri;
      if (fileUri.startsWith('content://')) {
        const fileName = buktiPembayaran.fileName || buktiPembayaran.name || 'bukti.jpg';
        const newPath = FileSystem.cacheDirectory + fileName;
        await FileSystem.copyAsync({ from: fileUri, to: newPath });
        fileUri = newPath;
      }
      const token = (await authService.getToken()) || '';
      const formData = new FormData();
      // @ts-ignore
      formData.append('uploadBukti', {
        uri: fileUri,
        name: buktiPembayaran.fileName || buktiPembayaran.name || 'bukti.jpg',
        type: buktiPembayaran.mimeType || 'image/jpeg', // PENTING: harus mime type, bukan 'image'
      });
      const endpoint = `${API_URL}/payments?bookingId=${bookingId}&namaBank=${selectedBank}`;
      console.log('Kirim payment:', {
        uri: fileUri,
        name: buktiPembayaran.fileName || buktiPembayaran.name || 'bukti.jpg',
        type: buktiPembayaran.type || 'image/jpeg',
        endpoint,
        token,
      });
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      if (response.ok && data && data.status === 'success') {
        Alert.alert('Sukses', 'Pembayaran berhasil dikirim');
        router.push('/(tabs)/profile');
      } else {
        Alert.alert('Gagal', data?.message || 'Terjadi kesalahan saat mengirim pembayaran');
      }
    } catch (error) {
      console.error('API Error:', error, JSON.stringify(error), error.stack);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengirim pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Pembayaran</ThemedText>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>ID Booking</ThemedText>
        <TextInput
          style={styles.input}
          value={bookingId}
          onChangeText={setBookingId}
          placeholder="Masukkan ID Booking"
          keyboardType="numeric"
          editable={initialBookingId === ''} // disable jika bookingIdParam ada
        />
      </ThemedView>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Nama Bank</ThemedText>
        <Picker
          selectedValue={selectedBank}
          onValueChange={(itemValue) => setSelectedBank(itemValue)}
          style={styles.input}
        >
          {bankList.map(bank => (
            <Picker.Item key={bank.value} label={bank.label} value={bank.value} />
          ))}
        </Picker>
      </ThemedView>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Nomor Rekening</ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ThemedText style={[styles.input, { flex: 1 }]}>{rekening}</ThemedText>
          <TouchableOpacity onPress={handleCopyRekening} style={styles.copyButton}>
            <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </ThemedView>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Upload Bukti Pembayaran (opsional)</ThemedText>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadBukti} disabled={loading}>
          <Ionicons name="image-outline" size={24} color={COLORS.primary} />
          <ThemedText style={styles.uploadButtonText}>Pilih dari Galeri</ThemedText>
        </TouchableOpacity>
        {buktiPembayaran && (
          <Image source={{ uri: buktiPembayaran.uri }} style={styles.buktiImage} />
        )}
      </ThemedView>
      <TouchableOpacity style={styles.submitButton} onPress={handleKirimPembayaran} disabled={loading}>
        <ThemedText style={styles.submitButtonText}>{loading ? 'Mengirim...' : 'Kirim'}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 12,
  },
  uploadButtonText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontSize: 16,
  },
  buktiImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 12,
    resizeMode: 'contain',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  copyButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
}); 