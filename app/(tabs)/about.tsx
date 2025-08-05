import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet } from 'react-native';

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

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Tentang Altura</ThemedText>
            <ThemedText style={styles.description}>
              Altura adalah platform travel terpercaya yang menyediakan berbagai paket wisata menarik di seluruh Indonesia. 
              Kami berkomitmen untuk memberikan pengalaman liburan yang tak terlupakan dengan pelayanan terbaik dan harga yang kompetitif.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Visi & Misi</ThemedText>
            <ThemedView style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <ThemedText style={styles.bulletText}>Menjadi platform travel terpercaya di Indonesia</ThemedText>
            </ThemedView>
            <ThemedView style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <ThemedText style={styles.bulletText}>Memberikan pengalaman liburan terbaik dengan harga terjangkau</ThemedText>
            </ThemedView>
            <ThemedView style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <ThemedText style={styles.bulletText}>Mendukung pariwisata lokal Indonesia</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Keunggulan Kami</ThemedText>
            <ThemedView style={styles.bulletItem}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <ThemedText style={styles.bulletText}>Tim profesional dan berpengalaman</ThemedText>
            </ThemedView>
            <ThemedView style={styles.bulletItem}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <ThemedText style={styles.bulletText}>Pelayanan 24/7</ThemedText>
            </ThemedView>
            <ThemedView style={styles.bulletItem}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <ThemedText style={styles.bulletText}>Harga transparan dan kompetitif</ThemedText>
            </ThemedView>
            
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Kontak Kami</ThemedText>
            <ThemedView style={styles.contactItem}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <ThemedText style={styles.contactText}>Jl. Sudirman No. 123, Payakumbuh</ThemedText>
            </ThemedView>
            <ThemedView style={styles.contactItem}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <ThemedText style={styles.contactText}>+62 22 8733 8654</ThemedText>
            </ThemedView>
            <ThemedView style={styles.contactItem}>
              <Ionicons name="mail" size={20} color={COLORS.primary} />
              <ThemedText style={styles.contactText}>info@altura.com</ThemedText>
            </ThemedView>
          </ThemedView>
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
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 12,
  },
}); 