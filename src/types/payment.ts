export type PaymentGateway = 'PAYPHONE' | 'KUSHKI';
export type PaymentMethod = 'app' | 'card';

export interface PaymentInitiation {
  reservationId?: string;
  socioId: string;
  socioName: string;
  amount: number;
  description: string;
  onSuccess?: (transaction: PaymentTransaction) => void;
  onCancel?: () => void;
}

export interface PaymentTransaction {
  transactionId: string;
  authorizationCode: string;
  gateway: PaymentGateway;
  amount: number;
  subtotal: number;
  vat: number;
  discount: number;
  status: 'APPROVED' | 'DECLINED' | 'PENDING';
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  paymentMethod: PaymentMethod;
  cardBrand?: string;
  cardLast4?: string;
  installments?: number;
  rucInstitucion: string;
  institutionName: string;
  timestamp: string;
  accessKeySRI?: string;
}
