import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { tourService } from '@/services/tourService';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Colors extracted from Altura logo
const COLORS = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  secondary: '#4f46e5',
  accent: '#c4b5fd',
  yellow: '#fbbf24',
  background: '#f8f9fa',
  white: '#fff',
  text: '#2d3436',
  textSecondary: '#636e72',
  border: '#e9ecef',
};

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

export default function DestinationsScreen() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc'>('price_asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
    fetchDestinations();
  }, [selectedLocation, sortBy]);

  const fetchLocations = async () => {
    try {
      const data = await tourService.getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const params: { location?: string; sortBy?: 'price_asc' | 'price_desc' } = {};
      if (selectedLocation) params.location = selectedLocation;
      if (sortBy) params.sortBy = sortBy;
      
      const data = await tourService.getAllDestinations(params);
      setDestinations(data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationPress = (id: number) => {
    router.push(`/detail/${id}`);
  };

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
        style={styles.header}
      >
        <ThemedText style={styles.headerTitle}>Destinasi</ThemedText>
      </LinearGradient>

      <ThemedView style={styles.filters}>
        <ThemedView style={styles.filterItem}>
          <ThemedText style={styles.filterLabel}>Lokasi</ThemedText>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedLocation}
              onValueChange={(value) => setSelectedLocation(value)}
              style={styles.picker}
              dropdownIconColor={COLORS.primary}
            >
              <Picker.Item label="Semua Lokasi" value="" color={COLORS.text} />
              {locations.map((location) => (
                <Picker.Item key={location} label={location} value={location} color={COLORS.text} />
              ))}
            </Picker>
          </View>
        </ThemedView>

        <ThemedView style={styles.filterItem}>
          <ThemedText style={styles.filterLabel}>Urutkan</ThemedText>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sortBy}
              onValueChange={(value) => setSortBy(value as 'price_asc' | 'price_desc')}
              style={styles.picker}
              dropdownIconColor={COLORS.primary}
            >
              <Picker.Item label="Harga: Rendah ke Tinggi" value="price_asc" color={COLORS.text} />
              <Picker.Item label="Harga: Tinggi ke Rendah" value="price_desc" color={COLORS.text} />
            </Picker>
          </View>
        </ThemedView>
      </ThemedView>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ThemedText>Loading...</ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.destinationsGrid}>
            {destinations.map((destination) => (
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
                    Rp {(destination.hargaDiskon || destination.price).toLocaleString('id-ID')}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  filters: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterItem: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  destinationsGrid: {
    padding: 16,
  },
  destinationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  destinationContent: {
    padding: 16,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
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
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  destinationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
}); 