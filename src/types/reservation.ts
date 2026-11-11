export type FacilityCategory = 'lodging' | 'sports';

export interface Facility {
  id: string;
  tenantId: 'croe' | 'circulo-militar';
  name: string;
  category: FacilityCategory;
  subcategory: string;
  capacity: number;
  description: string;
  amenities: string[];
  imageUrl: string;
  memberPrice: number;
  guestPrice: number;
  unit: 'noche' | 'hora' | 'evento';
  available: boolean;
  location: string;
}

export interface Reservation {
  id: string;
  tenantId: 'croe' | 'circulo-militar';
  facilityId: string;
  facilityName: string;
  category: FacilityCategory;
  checkIn: string;
  checkOut: string;
  guests: number;
  socioId: string;
  socioName: string;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  transactionId?: string;
  createdAt: string;
}
