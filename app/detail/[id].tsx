import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { tourService } from '@/services/tourService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

// Colors extracted from Altura logo
const COLORS = {
  primary: '#6366f1', // Purple from the logo
  primaryLight: '#818cf8', // Lighter purple for gradients
  secondary: '#4f46e5', // Darker purple
  accent: '#c4b5fd', // Light purple
  yellow: '#fbbf24', // Yellow for stars
  background: '#f8f9fa',
  white: '#fff',
  text: '#2d3436',
  textSecondary: '#636e72',
  border: '#e9ecef',
  lightGray: '#e0e0e0', // Ditambahkan untuk tab border
};

interface DestinationDetail {
  id: number;
  nama: string;
  image: string;
  description: string;
  harga: number;
  jumlah_orang: number;
  lokasi: string;
  itenary: string[];
  facilities: Array<{ id: number; name: string } | string>;
  jumlahBooking: number;
  galleries: string[];
}

// Render star rating
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={14} color={COLORS.yellow} />
      );
    } else if (i === fullStars && halfStar) {
      stars.push(
        <Ionicons key={`star-half-${i}`} name="star-half" size={14} color={COLORS.yellow} />
      );
    } else {
      stars.push(
        <Ionicons key={`star-outline-${i}`} name="star-outline" size={14} color={COLORS.yellow} />
      );
    }
  }
  
  return (
    <ThemedView style={{ flexDirection: 'row' }}>
      {stars}
    </ThemedView>
  );
};

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<DestinationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detail');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await tourService.getDestinationDetail(Number(id));
      setData(response);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBookNow = () => {
    router.push({
      pathname: '/booking',
      params: { id }
    });
  };

  if (loading || !data) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: data.image }} 
          style={styles.headerImage} 
        />
        
        <ThemedView style={styles.contentContainer}>
          {/* Tabs Navigation */}
          <ThemedView style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'detail' && styles.activeTab]} 
              onPress={() => setActiveTab('detail')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'detail' && styles.activeTabText]}>
                Detail
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'about' && styles.activeTab]} 
              onPress={() => setActiveTab('about')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
                About
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'profile' && styles.activeTab]} 
              onPress={() => setActiveTab('profile')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
                Galeri
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {activeTab === 'detail' ? (
            <>
              <ThemedView style={styles.headerInfo}>
                <ThemedView>
                  <ThemedText style={styles.title}>{data.nama}</ThemedText>
                  <ThemedView style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                    <ThemedText style={styles.location}>{data.lokasi}</ThemedText>
                  </ThemedView>
                </ThemedView>
                
                <ThemedView style={styles.priceRatingContainer}>
                  <ThemedText style={styles.price}>
                  Rp {(data.harga - data.hargaDiskon).toLocaleString('id-ID')}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Deskripsi</ThemedText>
                <ThemedText style={styles.description}>{data.description}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Informasi Tambahan</ThemedText>
                <ThemedView style={styles.infoGrid}>
                  <ThemedView style={styles.infoItem}>
                    <Ionicons name="people-outline" size={20} color={COLORS.primary} />
                    <ThemedText style={styles.infoLabel}>Kapasitas</ThemedText>
                    <ThemedText style={styles.infoValue}>{data.jumlah_orang} orang</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                    <ThemedText style={styles.infoLabel}>Booking</ThemedText>
                    <ThemedText style={styles.infoValue}>{data.jumlahBooking} kali</ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            </>
          ) : activeTab === 'about' ? (
            <>
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Itinerary</ThemedText>
                {data.itenary.map((day, index) => (
                  <ThemedView key={index} style={styles.itenaryItem}>
                    <ThemedView style={styles.itenaryDayContainer}>
                      <ThemedText style={styles.itenaryDay}>Hari {index + 1}</ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.itenaryText}>{day}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>

              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Fasilitas</ThemedText>
                {data.facilities.map((facility, index) => (
                  <ThemedView key={index} style={styles.bulletItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                    <ThemedText style={styles.bulletText}>
                      {typeof facility === 'object' ? facility.name : facility}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </>
          ) : (
            // Gallery Tab
            <>
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Galeri</ThemedText>
                <ThemedView style={styles.galleryGrid}>
                  {data.galleries.map((image, index) => (
                    <Image 
                      key={index}
                      source={{ uri: image }} 
                      style={styles.galleryImage} 
                    />
                  ))}
                </ThemedView>
              </ThemedView>
            </>
          )}

          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookButtonGradient}
            >
              <ThemedText style={styles.bookButtonText}>Pesan Sekarang</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
  },
  headerInfo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  itenaryItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itenaryDayContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itenaryDay: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itenaryText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
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
  mapPlaceholder: {
    height: 200,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapText: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  addressContainer: {
    marginTop: 16,
  },
  bookButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  bookButtonGradient: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  galleryImage: {
    width: '48%',
    height: 150,
    margin: '1%',
    borderRadius: 8,
  },
});