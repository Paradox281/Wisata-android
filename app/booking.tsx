import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { bookingService } from '@/services/bookingService';
import { tourService } from '@/services/tourService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

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
  yellow: '#ffcc00',
};

interface Participant {
  name: string;
  identityNumber: string;
  age: string;
}

interface Destination {
  id: number;
  nama: string;
  image: string;
  description: string;
  harga: number;
  jumlah_orang: number;
  lokasi: string;
  itenary: string[];
  facilities: string[];
  jumlahBooking: number;
  galleries: string[];
  hargaDiskon?: number;
}

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonial, setTestimonial] = useState('');
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    total_persons: '',
    departure_date: new Date(),
    return_date: new Date(),
    participants: [] as Participant[],
  });

  const [showDepartureDate, setShowDepartureDate] = useState(false);
  const [showReturnDate, setShowReturnDate] = useState(false);

  useEffect(() => {
    fetchDestinationDetails();
  }, [id]);

  const fetchDestinationDetails = async () => {
    try {
      const data = await tourService.getDestinationById(parseInt(id as string));
      setDestination(data);
    } catch (error) {
      console.error('Error fetching destination:', error);
      Alert.alert('Error', 'Gagal memuat detail destinasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.total_persons) {
      const total = parseInt(formData.total_persons);
      const newParticipants = Array(total).fill(null).map(() => ({
        name: '',
        identityNumber: '',
        age: '',
      }));
      setFormData(prev => ({ ...prev, participants: newParticipants }));
    }
  }, [formData.total_persons]);

  const handleDateChange = (event: any, selectedDate: Date | undefined, type: 'departure' | 'return') => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [type === 'departure' ? 'departure_date' : 'return_date']: selectedDate
      }));
    }
    if (type === 'departure') {
      setShowDepartureDate(false);
    } else {
      setShowReturnDate(false);
    }
  };

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...formData.participants];
    newParticipants[index] = {
      ...newParticipants[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, participants: newParticipants }));
  };

  const validateForm = () => {
    if (!formData.total_persons) {
      Alert.alert('Error', 'Jumlah orang harus diisi');
      return false;
    }

    if (formData.participants.some(p => !p.name || !p.identityNumber || !p.age)) {
      Alert.alert('Error', 'Semua data peserta harus diisi');
      return false;
    }

    if (formData.departure_date >= formData.return_date) {
      Alert.alert('Error', 'Tanggal kembali harus setelah tanggal keberangkatan');
      return false;
    }

    return true;
  };

  const calculateTotalPrice = () => {
    if (!destination || !formData.total_persons) return 0;
  const price = destination.harga - destination.hargaDiskon;
    return price * parseInt(formData.total_persons);
  };

  const handleSubmitTestimonial = async () => {
    try {
      if (!testimonial || rating === 0) {
        Alert.alert('Error', 'Mohon isi testimonial dan rating');
        return;
      }

      await api.post('/testimonials', {
        testimonial,
        rating
      });

      Alert.alert('Sukses', 'Terima kasih atas testimonial Anda');
      setShowTestimonialModal(false);
      router.back();
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      if (error instanceof Error && error.message.includes('401')) {
        Alert.alert('Error', 'Sesi Anda telah berakhir. Silakan login kembali.');
        router.replace('/login');
      } else {
        Alert.alert('Error', 'Gagal mengirim testimonial. Silakan coba lagi.');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'Anda harus login terlebih dahulu');
        router.push('/login');
        return;
      }

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      const bookingData = {
        package_id: destination?.id || parseInt(id as string),
        user_id: user.id,
        total_persons: parseInt(formData.total_persons),
        status: 'PENDING',
        departure_date: formData.departure_date.toISOString(),
        return_date: formData.return_date.toISOString(),
        participants: formData.participants.map(p => ({
          ...p,
          age: parseInt(p.age)
        }))
      };

      console.log('Sending booking data:', bookingData);
      const response = await bookingService.createBooking(bookingData);
      console.log('Booking response:', response);
      
      Alert.alert('Sukses', 'Booking berhasil dibuat');
      setShowTestimonialModal(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Gagal membuat booking. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Formulir Booking',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Detail Destinasi</ThemedText>
            <ThemedView style={styles.destinationInfo}>
              <ThemedText style={styles.destinationName}>{destination?.nama}</ThemedText>
              <ThemedView style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                <ThemedText style={styles.destinationLocation}>{destination?.lokasi}</ThemedText>
              </ThemedView>
              <ThemedText style={styles.destinationPrice}>
              Rp {(destination.harga - destination.hargaDiskon).toLocaleString('id-ID')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Detail Perjalanan</ThemedText>
            
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Jumlah Orang</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.total_persons}
                onChangeText={(text) => setFormData({ ...formData, total_persons: text })}
                placeholder="Masukkan jumlah orang"
                keyboardType="numeric"
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Total Harga</ThemedText>
              <ThemedView style={styles.totalPriceContainer}>
                <ThemedText style={styles.totalPrice}>
                  Rp {calculateTotalPrice().toLocaleString('id-ID')}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Tanggal Keberangkatan</ThemedText>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => setShowDepartureDate(true)}
              >
                <ThemedText>
                  {formData.departure_date.toLocaleDateString('id-ID')}
                </ThemedText>
              </TouchableOpacity>
              {showDepartureDate && (
                <DateTimePicker
                  value={formData.departure_date}
                  mode="date"
                  onChange={(event, date) => handleDateChange(event, date, 'departure')}
                />
              )}
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Tanggal Kembali</ThemedText>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => setShowReturnDate(true)}
              >
                <ThemedText>
                  {formData.return_date.toLocaleDateString('id-ID')}
                </ThemedText>
              </TouchableOpacity>
              {showReturnDate && (
                <DateTimePicker
                  value={formData.return_date}
                  mode="date"
                  onChange={(event, date) => handleDateChange(event, date, 'return')}
                />
              )}
            </ThemedView>
          </ThemedView>

          {formData.participants.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Data Peserta</ThemedText>
              {formData.participants.map((participant, index) => (
                <ThemedView key={index} style={styles.participantContainer}>
                  <ThemedText style={styles.participantTitle}>Peserta {index + 1}</ThemedText>
                  
                  <ThemedView style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Nama Lengkap</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={participant.name}
                      onChangeText={(text) => handleParticipantChange(index, 'name', text)}
                      placeholder="Masukkan nama lengkap"
                    />
                  </ThemedView>

                  <ThemedView style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Nomor KTP</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={participant.identityNumber}
                      onChangeText={(text) => handleParticipantChange(index, 'identityNumber', text)}
                      placeholder="Masukkan nomor KTP"
                      keyboardType="numeric"
                    />
                  </ThemedView>

                  <ThemedView style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Usia</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={participant.age}
                      onChangeText={(text) => handleParticipantChange(index, 'age', text)}
                      placeholder="Masukkan usia"
                      keyboardType="numeric"
                    />
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              <ThemedText style={styles.submitButtonText}>
                {loading ? 'Memproses...' : 'Kirim Booking'}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>

      <Modal
        visible={showTestimonialModal}
        transparent
        animationType="slide"
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
          <TouchableOpacity 
            onPress={() => {
              const phoneNumber = '6282287338654'; // Ganti dengan nomor WA Anda
              const message = 'Halo, saya sudah memesan paket wisata melalui aplikasi. Mohon informasi untuk melanjutkan pembayaran. Terima kasih.';
              const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
              Linking.openURL(url);
            }}
            style={styles.whatsappButton}
          >
            <ThemedText style={styles.modalTitle}>
              Pembayaran lanjut di whatsapp
            </ThemedText>
          </TouchableOpacity>            
            <ThemedText style={styles.modalTitle}>Berikan Testimonial</ThemedText>
            <ThemedView style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color={COLORS.yellow}
                  />
                </TouchableOpacity>
              ))}
            </ThemedView>

            <TextInput
              style={styles.testimonialInput}
              placeholder="Tulis testimonial Anda..."
              multiline
              numberOfLines={4}
              value={testimonial}
              onChangeText={setTestimonial}
            />

            <TouchableOpacity
              style={styles.submitTestimonialButton}
              onPress={handleSubmitTestimonial}
            >
              <ThemedText style={styles.submitTestimonialText}>Kirim Testimonial</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setShowTestimonialModal(false);
                router.back();
              }}
            >
              <ThemedText style={styles.skipButtonText}>Lewati</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  destinationInfo: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  destinationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
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
  participantContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  participantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPriceContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  whatsappButton: {
      backgroundColor: '#25D366', // Warna hijau WhatsApp
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  testimonialInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitTestimonialButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitTestimonialText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
}); 