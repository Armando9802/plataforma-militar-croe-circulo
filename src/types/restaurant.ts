import { TenantId } from './tenant';

export type ShiftType = 'desayuno' | 'almuerzo' | 'cena';

export type EventType =
  | 'banquete_gala'
  | 'almuerzo_campestre'
  | 'coctel_honor'
  | 'desayuno_trabajo'
  | 'evento_social';

export type RoomSetup =
  | 'banquete_mesas'
  | 'imperial_u'
  | 'auditorio'
  | 'coctel_lounge';

export interface ShiftInfo {
  type: ShiftType;
  label: string;
  hours: string;
  description: string;
  memberPrice: number;
  guestPrice: number;
  iconName: string;
}

export interface DiningHallFacility {
  id: string;
  tenantId: TenantId;
  name: string;
  hallType: 'comedor' | 'salon_eventos' | 'pergola_exterior';
  capacity: number;
  description: string;
  amenities: string[];
  imageUrl: string;
  supportedShifts: ShiftType[];
  supportsEvents: boolean;
  baseRentalMember: number;
  baseRentalGuest: number;
  location: string;
}

export interface MenuItemOption {
  id: string;
  tenantId: TenantId;
  category: 'desayuno' | 'almuerzo' | 'cena' | 'banquete_gala' | 'coctel' | 'campestre';
  name: string;
  description: string;
  starter?: string;
  mainCourse: string;
  dessert?: string;
  drinksIncluded: string;
  memberPricePerPax: number;
  guestPricePerPax: number;
}

export interface RestaurantShiftBooking {
  id: string; // e.g. RSV-SHF-CROE-1029
  tenantId: TenantId;
  facilityId: string;
  facilityName: string;
  shiftType: ShiftType;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  paxCount: number;
  isOperationalExecution: boolean; // True if executed by comedor management, false if socio table reservation
  socioId: string;
  socioName: string;
  menuId: string;
  menuName: string;
  subtotal: number;
  militaryDiscount: number;
  vat: number;
  total: number;
  status: 'confirmed' | 'executed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  stockDeducted: boolean;
  createdAt: string;
  notes?: string;
}

export interface BanquetAdditionalService {
  serviceId: string;
  name: string;
  price: number;
  selected: boolean;
}

export interface EventBanquetBooking {
  id: string; // e.g. EVT-CROE-2041
  tenantId: TenantId;
  facilityId: string;
  facilityName: string;
  eventType: EventType;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  paxCount: number;
  roomSetup: RoomSetup;
  menuId: string;
  menuName: string;
  hallRentalPrice: number;
  cateringPrice: number;
  additionalServices: BanquetAdditionalService[];
  subtotal: number;
  militaryDiscount: number;
  vat: number;
  total: number;
  socioId: string;
  socioName: string;
  status: 'confirmed' | 'in_progress' | 'settled' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  tablewareDeployed: boolean;
  tablewareReturned: boolean;
  stockDeducted: boolean;
  createdAt: string;
  notes?: string;
}

export interface RecipeRequirementItem {
  sku: string;
  itemName: string;
  category: 'insumos_descartables' | 'menaje_cubiertos' | 'bebidas' | 'alimentos_cocina';
  quantityPerPax: number;
  unit: string;
  isConsumable: boolean; // False for tableware (retornable)
}
