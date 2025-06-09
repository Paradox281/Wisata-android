import { api } from './api';

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

interface DestinationDetail {
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
}

interface Testimonial {
  id: number;
  testimonial: string;
  rating: number;
  userName: string;
  createdAt: string;
}

interface ApiResponse<T> {
  data: T;
  status: string;
}

export const tourService = {
  async getPromoPackages(): Promise<TourPackage[]> {
    try {
      const response = await api.get<ApiResponse<{ tourPackages: TourPackage[] }>>('/tour-package-diskon');
      return response.data.tourPackages;
    } catch (error) {
      console.error('Error fetching promo packages:', error);
      throw error;
    }
  },

  async getTopDestinations(): Promise<Destination[]> {
    try {
      const response = await api.get<ApiResponse<{ destinations: Destination[] }>>('/destinations/top');
      return response.data.destinations;
    } catch (error) {
      console.error('Error fetching top destinations:', error);
      throw error;
    }
  },

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const response = await api.get<ApiResponse<{ testimonials: Testimonial[] }>>('/testimonials');
      return response.data.testimonials;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },

  async getDestinationDetail(id: number): Promise<DestinationDetail> {
    try {
      const response = await api.get(`/destinations/${id}/detail`);
      return response.data.destination;
    } catch (error) {
      console.error('Error fetching destination detail:', error);
      throw error;
    }
  },

  async getAllDestinations(params?: { location?: string; sortBy?: 'price_asc' | 'price_desc' }): Promise<Destination[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.location) queryParams.append('location', params.location);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      
      const response = await api.get(`/destinations?${queryParams.toString()}`);
      return response.data.destinations;
    } catch (error) {
      console.error('Error fetching all destinations:', error);
      throw error;
    }
  },

  async getLocations(): Promise<string[]> {
    try {
      const response = await api.get('/locations');
      return response.data.locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  getDestinationById: async (id: number) => {
    const response = await api.get(`/destinations/${id}/detail`);
    return response.data.destination;
  }
}; 