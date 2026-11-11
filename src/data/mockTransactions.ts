import { PaymentTransaction } from '../types/payment';
import { Reservation } from '../types/reservation';

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    transactionId: 'TX-CROE-2026-001',
    authorizationCode: 'AUTH-PAYPHONE-98214',
    gateway: 'PAYPHONE',
    amount: 65.00,
    subtotal: 56.52,
    vat: 8.48,
    discount: 0,
    status: 'APPROVED',
    customerId: '1714859621',
    customerName: 'CRNL. DE E.M. CARLOS ALBERTO MENDOZA SILVA',
    customerEmail: 'carlos.mendoza@ejercito.mil.ec',
    customerPhone: '0998765432',
    description: 'Reserva Cabaña Familiar Andina - 1 Noche',
    paymentMethod: 'app',
    rucInstitucion: '1790014298001',
    institutionName: 'Club de Recreación de Oficiales del Ejército',
    timestamp: '2026-11-08T14:30:00Z',
    accessKeySRI: '0811202601179001429800120010010000000011234567819'
  },
  {
    transactionId: 'TX-CIR-2026-002',
    authorizationCode: 'AUTH-KUSHKI-41829',
    gateway: 'KUSHKI',
    amount: 55.00,
    subtotal: 47.83,
    vat: 7.17,
    discount: 0,
    status: 'APPROVED',
    customerId: '1709823415',
    customerName: 'VALM. (S.P.) PATRICIO RENATO VALLEJO CORONEL',
    customerEmail: 'patricio.vallejo@fuerzasarmadas.mil.ec',
    paymentMethod: 'card',
    cardBrand: 'VISA',
    cardLast4: '4500',
    installments: 1,
    description: 'Reserva Suite de Honor Círculo Militar',
    rucInstitucion: '1790025812001',
    institutionName: 'Círculo Militar del Ecuador',
    timestamp: '2026-11-07T11:15:00Z',
    accessKeySRI: '0711202601179002581200120010010000000029876543212'
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'RSV-CROE-7841',
    tenantId: 'croe',
    facilityId: 'croe-fac-01',
    facilityName: 'Cabaña Familiar Andina',
    category: 'lodging',
    checkIn: '2026-11-14',
    checkOut: '2026-11-15',
    guests: 4,
    socioId: 'SOC-CROE-0094',
    socioName: 'CRNL. DE E.M. CARLOS ALBERTO MENDOZA SILVA',
    subtotal: 65.00,
    discount: 0,
    vat: 9.75,
    total: 74.75,
    status: 'confirmed',
    paymentStatus: 'paid',
    transactionId: 'TX-CROE-2026-001',
    createdAt: '2026-11-08T14:30:00Z'
  },
  {
    id: 'RSV-CIR-3209',
    tenantId: 'circulo-militar',
    facilityId: 'cir-fac-01',
    facilityName: 'Suite de Honor Círculo Militar',
    category: 'lodging',
    checkIn: '2026-11-20',
    checkOut: '2026-11-21',
    guests: 2,
    socioId: 'SOC-CIR-0182',
    socioName: 'VALM. (S.P.) PATRICIO RENATO VALLEJO CORONEL',
    subtotal: 55.00,
    discount: 0,
    vat: 8.25,
    total: 63.25,
    status: 'confirmed',
    paymentStatus: 'paid',
    transactionId: 'TX-CIR-2026-002',
    createdAt: '2026-11-07T11:15:00Z'
  }
];
