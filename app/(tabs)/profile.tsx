import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

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

interface UserProfile {
  email: string;
  fullname: string;
  phone: string;
  bookingHistory: {
    bookingId: number;
    userId: number;
    packageId: number;
    totalPersons: number;
    status: string;
    bookingDate: string;
    departureDate: string;
    returnDate: string;
    totalPrice: number;
  }[];
}

interface EditProfileData {
  email: string;
  fullname: string;
  phone: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editData, setEditData] = useState<EditProfileData>({
    email: '',
    fullname: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
  });
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data);
      setEditData({
        email: response.data.email,
        fullname: response.data.fullname,
        phone: response.data.phone,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error instanceof Error && error.message.includes('401')) {
        Alert.alert('Error', 'Sesi Anda telah berakhir. Silakan login kembali.');
        router.replace('/login');
      } else {
        Alert.alert('Error', 'Gagal memuat data profil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      await api.put('/user/profile', editData);
      Alert.alert('Sukses', 'Profil berhasil diperbarui');
      setShowEditModal(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error && error.message.includes('401')) {
        Alert.alert('Error', 'Sesi Anda telah berakhir. Silakan login kembali.');
        router.replace('/login');
      } else {
        Alert.alert('Error', 'Gagal mengubah profil');
      }
    }
  };

  const handleChangePassword = async () => {
    try {
      await api.put('/user/profile/password', passwordData);
      Alert.alert('Sukses', 'Password berhasil diubah');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error instanceof Error && error.message.includes('401')) {
        Alert.alert('Error', 'Sesi Anda telah berakhir. Silakan login kembali.');
        router.replace('/login');
      } else {
        Alert.alert('Error', 'Gagal mengubah password');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Gagal keluar');
    }
  };

  const getStatusGroup = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Menunggu Konfirmasi';
      case 'CONFIRMED':
        return 'Terkonfirmasi';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return 'Status Lainnya';
    }
  };

  const groupedBookings = profile?.bookingHistory.reduce((acc, booking) => {
    const statusGroup = getStatusGroup(booking.status);
    if (!acc[statusGroup]) {
      acc[statusGroup] = [];
    }
    acc[statusGroup].push(booking);
    return acc;
  }, {} as { [key: string]: typeof profile.bookingHistory });

  const toggleStatus = (status: string) => {
    setExpandedStatus(expandedStatus === status ? null : status);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return '#f59e0b'; // Orange
      case 'CONFIRMED':
        return '#10b981'; // Green
      case 'CANCELLED':
        return '#ef4444'; // Red
      default:
        return COLORS.primary;
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.profileContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.profileImage}
            />
            <ThemedText style={styles.profileName}>{profile?.fullname}</ThemedText>
            <ThemedText style={styles.profileEmail}>{profile?.email}</ThemedText>
            <ThemedText style={styles.profilePhone}>{profile?.phone}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Riwayat Booking</ThemedText>
            {groupedBookings && Object.entries(groupedBookings).map(([status, bookings]) => (
              <ThemedView key={status} style={styles.bookingGroup}>
                <TouchableOpacity
                  style={styles.bookingGroupHeader}
                  onPress={() => toggleStatus(status)}
                >
                  <ThemedView style={styles.bookingGroupHeaderContent}>
                    <ThemedText style={styles.bookingGroupTitle}>{status}</ThemedText>
                    <ThemedText style={styles.bookingGroupCount}>({bookings.length})</ThemedText>
                  </ThemedView>
                  <Ionicons
                    name={expandedStatus === status ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>

                {expandedStatus === status && bookings.map((booking) => (
                  <ThemedView key={booking.bookingId} style={styles.bookingItem}>
                    <ThemedView style={styles.bookingHeader}>
                      <ThemedView style={styles.bookingHeaderContent}>
                        <ThemedText style={styles.bookingTitle}>Booking #{booking.bookingId}</ThemedText>
                        <ThemedText style={[styles.bookingStatus, { color: getStatusColor(booking.status) }]}>
                          {booking.status}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.bookingDetails}>
                      <ThemedView style={styles.bookingDetailItem}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                        <ThemedText style={styles.bookingDetailText}>
                          Tanggal Booking: {new Date(booking.bookingDate).toLocaleDateString('id-ID')}
                        </ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.bookingDetailItem}>
                        <Ionicons name="airplane-outline" size={16} color={COLORS.textSecondary} />
                        <ThemedText style={styles.bookingDetailText}>
                          Keberangkatan: {new Date(booking.departureDate).toLocaleDateString('id-ID')}
                        </ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.bookingDetailItem}>
                        <Ionicons name="return-up-back-outline" size={16} color={COLORS.textSecondary} />
                        <ThemedText style={styles.bookingDetailText}>
                          Kembali: {new Date(booking.returnDate).toLocaleDateString('id-ID')}
                        </ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.bookingDetailItem}>
                        <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
                        <ThemedText style={styles.bookingDetailText}>
                          Jumlah Orang: {booking.totalPersons}
                        </ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.bookingDetailItem}>
                        <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
                        <ThemedText style={styles.bookingDetailText}>
                          Total: Rp {booking.totalPrice.toLocaleString('id-ID')}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                ))}
              </ThemedView>
            ))}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Pengaturan</ThemedText>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              <ThemedText style={styles.settingText}>Edit Profil</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowPasswordModal(true)}
            >
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
              <ThemedText style={styles.settingText}>Ubah Password</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
              <ThemedText style={styles.settingText}>Keluar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Edit Profil</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Nama Lengkap"
              value={editData.fullname}
              onChangeText={(text) => setEditData({ ...editData, fullname: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editData.email}
              onChangeText={(text) => setEditData({ ...editData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Nomor Telepon"
              value={editData.phone}
              onChangeText={(text) => setEditData({ ...editData, phone: text })}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleEditProfile}
            >
              <ThemedText style={styles.submitButtonText}>Simpan</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Batal</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Ubah Password</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Password Saat Ini"
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password Baru"
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleChangePassword}
            >
              <ThemedText style={styles.submitButtonText}>Ubah Password</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPasswordModal(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Batal</ThemedText>
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
  profileContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  bookingGroup: {
    marginBottom: 16,
  },
  bookingGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookingGroupHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingGroupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bookingGroupCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  bookingItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 8,
    marginLeft: 16,
    overflow: 'hidden',
  },
  bookingHeader: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  bookingHeaderContent: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookingDetails: {
    backgroundColor: COLORS.background,
    padding: 12,
  },
  bookingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookingDetailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
}); 