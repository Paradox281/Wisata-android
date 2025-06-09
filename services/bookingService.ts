import { api } from './api';
import { authService } from './authService';

interface BookingData {
  package_id: number;
  user_id: number;
  total_persons: number;
  status: string;
  departure_date: string;
  return_date: string;
  participants: {
    name: string;
    identityNumber: string;
    age: number;
  }[];
}

export const bookingService = {
  createBooking: async (data: BookingData) => {
    const token = await authService.getToken();
    if (!token) {
      throw new Error('Anda harus login terlebih dahulu');
    }
    
    return api.post('/bookings', data);
  },
}; 