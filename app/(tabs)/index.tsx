import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { tourService } from '@/services/tourService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';

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
  statusBar: '#e0e0e0',
}

interface TourPackage {
  promoId: number;
  idDestinasi: number;
  namaDestinasi: string;
  deskripsiDestinasi: string;
  hargaAsli: number;
  hargaDiskon: number;
  persentaseDiskon: number;
  jumlahBooking: number;
  gambarDestinasi: string;
  lokasiDestinasi: string;
}

interface Destination {
  id: number;
  nama: string;
  location: string;
  imageUrl: string;
  description: string;
  price: number;
  quota: number;
  itenary: string[];
  jumlahBooking: number;
  hargaDiskon: number | null;
  persentaseDiskon: number | null;
  promoId: number | null;
}

interface Testimonial {
  id: number;
  testimonial: string;
  rating: number;
  userName: string;
  createdAt: string;
}

export default function DashboardScreen() {
  const { logout } = useAuth();
  const [promoPackages, setPromoPackages] = useState<TourPackage[]>([]);
  const [topDestinations, setTopDestinations] = useState<Destination[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const promos = await tourService.getPromoPackages();
      // Mapping promoPackages ke struktur Destination
      const mappedDestinations = promos.map((item) => ({
        id: item.idDestinasi,
        nama: item.namaDestinasi,
        location: item.lokasiDestinasi,
        imageUrl: item.gambarDestinasi,
        description: item.deskripsiDestinasi,
        price: item.hargaAsli,
        quota: 0, // default jika tidak ada di API
        itenary: [], // default jika tidak ada di API
        jumlahBooking: item.jumlahBooking,
        hargaDiskon: item.hargaDiskon,
        persentaseDiskon: item.persentaseDiskon,
        promoId: item.promoId,
      }));
      setTopDestinations(mappedDestinations);
      setPromoPackages(promos);
      // Jika ingin tetap ambil testimonials
      const testimonialData = await tourService.getTestimonials();
      setTestimonials(testimonialData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
  // Navigation handlers
  const handleDestinationPress = (id: number) => {
    router.push(`/detail/${id}`);
  };

  const handleOfferPress = (id: number) => {
    router.push(`/detail/${id}?type=offer`);
  };

  const handleTestimonialPress = (id: number) => {
    router.push(`/detail/${id}?type=testimonial`);
  };

  const handleSeeAllDestinations = () => {
    router.push('/(tabs)/destinations');
  };

  const handleSeeAllOffers = () => {
    router.push('/(tabs)/destinations' as any);
  };

  const handleSeeAllTestimonials = () => {
    router.push('/testimonials' as any);
  };

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

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={{ flex: 1 }}
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Altura Travel</ThemedText>
          <ThemedView style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Ionicons name="person-circle-outline" size={28} color={COLORS.primary} />
            </TouchableOpacity>

            {showDropdown && (
              <ThemedView style={styles.dropdownMenu}>
                <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
                  <ThemedText style={styles.dropdownText}>Logout</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>

        <ScrollView 
          style={[styles.scrollView, { backgroundColor: COLORS.background }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner Section */}
          <ThemedView style={styles.bannerContainer}>
            <Swiper
              autoplay
              autoplayTimeout={5}
              showsPagination={true}
              dotStyle={styles.swiperDot}
              activeDotStyle={styles.swiperActiveDot}
              style={styles.swiperContainer}
            >
              {promoPackages.map((promo, index) => (
                <ImageBackground 
                  key={promo.promoId}
                  source={{ uri: promo.gambarDestinasi }}
                  style={styles.banner}
                  imageStyle={styles.bannerImage}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.bannerGradient}
                  >
                    <ThemedText style={styles.bannerTitle}>{promo.namaDestinasi}</ThemedText>
                    <ThemedText style={styles.bannerSubtitle}>
                      Diskon {promo.persentaseDiskon}% untuk {promo.deskripsiDestinasi}
                    </ThemedText>
                  </LinearGradient>
                </ImageBackground>
              ))}
            </Swiper>
          </ThemedView>

          <ThemedView style={styles.content}>
            {/* Special Offers & Promotions */}
            <ThemedView style={styles.sectionContainer}>
              <ThemedView style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Special Offers & Promotions</ThemedText>
                <TouchableOpacity onPress={handleSeeAllOffers}>
                  <ThemedText style={styles.seeAllText}>Lihat Semua</ThemedText>
                </TouchableOpacity>
              </ThemedView>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScrollView}
              >
                {promoPackages.map((promo) => (
                  <TouchableOpacity 
                    key={promo.promoId} 
                    style={styles.offerCard}
                    onPress={() => handleOfferPress(promo.idDestinasi)}
                  >
                    <Image source={{ uri: promo.gambarDestinasi }} style={styles.offerImage} />
                    <ThemedView style={styles.offerContent}>
                      <ThemedText style={styles.offerTitle}>{promo.namaDestinasi}</ThemedText>
                      <ThemedText style={styles.offerDescription}>
                        Diskon {promo.persentaseDiskon}% - {promo.deskripsiDestinasi}
                      </ThemedText>
                      <ThemedText style={styles.offerPrice}>
                        Rp {(promo.hargaAsli - promo.hargaDiskon).toLocaleString('id-ID')}
                      </ThemedText>
                      {promo.hargaDiskon > 0 && (
                        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <ThemedText style={{ textDecorationLine: 'line-through', color: '#888', fontSize: 14 }}>
                            Rp {promo.hargaAsli.toLocaleString('id-ID')}
                          </ThemedText>
                          <ThemedText style={{ color: 'green', fontWeight: 'bold', fontSize: 14, marginLeft: 8 }}>
                            Hemat Rp {promo.hargaDiskon.toLocaleString('id-ID')}!
                          </ThemedText>
                        </ThemedView>
                      )}
                    </ThemedView>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>

            {/* Popular Destinations */}
            <ThemedView style={styles.sectionContainer}>
              <ThemedView style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Popular Destinations</ThemedText>
                <TouchableOpacity onPress={handleSeeAllDestinations}>
                  <ThemedText style={styles.seeAllText}>Lihat Semua</ThemedText>
                </TouchableOpacity>
              </ThemedView>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScrollView}
              >
                {topDestinations.map((destination) => (
                  <TouchableOpacity 
                    key={destination.id} 
                    style={styles.destinationCard}
                    onPress={() => handleDestinationPress(destination.id)}
                  >
                    <Image source={{ uri: destination.imageUrl }} style={styles.destinationImage} />
                    <ThemedView style={styles.destinationContent}>
                      <ThemedText style={styles.destinationName}>{destination.nama}</ThemedText>
                      <ThemedView style={styles.destinationDetails}>
                        <ThemedView style={styles.locationContainer}>
                          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                          <ThemedText style={styles.destinationLocation}>{destination.location}</ThemedText>
                        </ThemedView>
                      </ThemedView>
                      <ThemedText style={styles.destinationPrice}>
                        Rp {(destination.price - (destination.hargaDiskon || 0)).toLocaleString('id-ID')}
                      </ThemedText>
                      {destination.hargaDiskon > 0 && (
                        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <ThemedText style={{ textDecorationLine: 'line-through', color: '#888', fontSize: 14 }}>
                            Rp {destination.price.toLocaleString('id-ID')}
                          </ThemedText>
                          <ThemedText style={{ color: 'green', fontWeight: 'bold', fontSize: 14, marginLeft: 8 }}>
                            Hemat Rp {destination.hargaDiskon.toLocaleString('id-ID')}!
                          </ThemedText>
                        </ThemedView>
                      )}
                    </ThemedView>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>

            {/* Testimonials */}
            <ThemedView style={styles.sectionContainer}>
              <ThemedView style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>What Our Travelers Say</ThemedText>
              </ThemedView>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScrollView}
              >
                {testimonials.map((testimonial) => (
                  <TouchableOpacity 
                    key={testimonial.id} 
                    style={styles.testimonialCard}
                    onPress={() => handleTestimonialPress(testimonial.id)}
                  >
                    <ThemedView style={styles.testimonialHeader}>
                      <ThemedView style={styles.testimonialUser}>
                        <ThemedText style={styles.testimonialName}>{testimonial.userName}</ThemedText>
                        <ThemedText style={styles.testimonialDate}>
                          {new Date(testimonial.createdAt).toLocaleDateString('id-ID')}
                        </ThemedText>
                      </ThemedView>
                      <ThemedView style={styles.testimonialRating}>
                        {renderStars(testimonial.rating)}
                      </ThemedView>
                    </ThemedView>
                    <ThemedText style={styles.testimonialComment}>"{testimonial.testimonial}"</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </LinearGradient>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  profileButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
    minWidth: 120,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownText: {
    color: COLORS.text,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 15,
    gap: 20,
  },
  // Banner styles
  bannerContainer: {
    height: 200,
    marginBottom: 20,
  },
  swiperContainer: {
    height: 200,
  },
  banner: {
    height: 200,
    justifyContent: 'flex-end',
  },
  bannerImage: {
    borderRadius: 0,
  },
  bannerGradient: {
    height: '100%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 10,
  },
  swiperDot: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  swiperActiveDot: {
    backgroundColor: COLORS.white,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  // Section styles
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScrollView: {
    paddingBottom: 5,
  },
  // Special Offers styles
  offerCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  offerImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  offerContent: {
    padding: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  offerDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  offerPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Destination styles
  destinationCard: {
    width: 220,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  destinationContent: {
    padding: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  destinationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 5,
  },
  destinationPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Testimonial styles
  testimonialCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testimonialHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  testimonialUser: {
    flex: 1,
    justifyContent: 'center',
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  testimonialDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  testimonialRating: {
    alignItems: 'flex-end',
  },
  testimonialComment: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});