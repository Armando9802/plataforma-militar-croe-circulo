import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useTenant } from './TenantContext';
import { TenantId } from '../types/tenant';
import {
  PaymentGateway,
  PaymentMethod,
  PaymentInitiation,
  PaymentTransaction,
} from '../types/payment';
import { INITIAL_TRANSACTIONS } from '../data/mockTransactions';
import confetti from 'canvas-confetti';

export type PaymentState =
  | 'IDLE'
  | 'INITIATED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'VOUCHER_ISSUED'
  | 'DECLINED';

export const ECUADOR_IVA_RATE = 0.15;

/**
 * Rounds a financial amount to exactly 2 decimals
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates 15% IVA tax for SRI Ecuador
 */
export function calculateVat15(taxableBase: number): number {
  if (taxableBase <= 0) return 0;
  return roundCurrency(taxableBase * ECUADOR_IVA_RATE);
}

/**
 * Formats a USD numeric amount to currency string ($X,XXX.XX)
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface FinancialBreakdown {
  subtotal: number;
  militaryDiscount: number;
  taxableSubtotal: number;
  vat: number;
  total: number;
  isComplimentary: boolean;
}

/**
 * Computes complete itemized billing breakdown for SRI compliance
 */
export function computeBillingBreakdown(params: {
  regularPrice: number;
  memberPrice: number;
  units: number;
  isMember: boolean;
  isTaxExempt?: boolean;
}): FinancialBreakdown {
  const { regularPrice, memberPrice, units, isMember, isTaxExempt = false } = params;

  if (units <= 0) {
    throw new Error('Units must be greater than zero');
  }

  const baseRate = isMember ? memberPrice : regularPrice;
  const regularTotal = roundCurrency(regularPrice * units);
  const actualSubtotal = roundCurrency(baseRate * units);

  const militaryDiscount = isMember ? roundCurrency(Math.max(0, regularTotal - actualSubtotal)) : 0;
  const taxableSubtotal = Math.max(0, actualSubtotal);
  const isComplimentary = taxableSubtotal === 0;

  const vat = isTaxExempt || isComplimentary ? 0 : calculateVat15(taxableSubtotal);
  const total = roundCurrency(taxableSubtotal + vat);

  return {
    subtotal: actualSubtotal,
    militaryDiscount,
    taxableSubtotal,
    vat,
    total,
    isComplimentary,
  };
}

/**
 * Generates an official 49-digit SRI electronic access key with Modulo 11 check digit
 */
export function generateSriAccessKey(ruc: string, date: Date, seqNum: number): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear());
  const dateStr = `${d}${m}${y}`;
  const docType = '01'; // Factura electrónica
  const paddedRuc = ruc.padEnd(13, '0').slice(0, 13);
  const env = '1'; // 1: Pruebas / 2: Producción
  const est = '001001';
  const seq = String(seqNum).padStart(9, '0');
  const numericCode = '12345678';
  const emissionType = '1'; // Normal

  const partialKey = `${dateStr}${docType}${paddedRuc}${env}${est}${seq}${numericCode}${emissionType}`;

  // Modulo 11 check digit algorithm
  let sum = 0;
  let factor = 2;
  for (let i = partialKey.length - 1; i >= 0; i--) {
    sum += parseInt(partialKey.charAt(i), 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const mod11 = 11 - (sum % 11);
  const checkDigit = mod11 === 11 ? 0 : mod11 === 10 ? 1 : mod11;

  return `${partialKey}${checkDigit}`;
}

export interface PaymentContextType {
  paymentState: PaymentState;
  selectedGateway: PaymentGateway;
  setSelectedGateway: (gateway: PaymentGateway) => void;
  currentInitiation: PaymentInitiation | null;
  currentTransaction: PaymentTransaction | null;
  isCheckoutModalOpen: boolean;
  isReceiptModalOpen: boolean;
  processingStep: string;
  transactions: PaymentTransaction[];
  allTransactions: Record<TenantId, PaymentTransaction[]>;
  initiatePayment: (initiation: PaymentInitiation, defaultGateway?: PaymentGateway) => void;
  processPayment: (details: {
    gateway: PaymentGateway;
    method: PaymentMethod;
    phone?: string;
    cardBrand?: string;
    cardLast4?: string;
    installments?: number;
  }) => Promise<PaymentTransaction>;
  openReceiptModal: (transaction: PaymentTransaction) => void;
  closeReceiptModal: () => void;
  closeCheckoutModal: () => void;
  resetPaymentState: () => void;
  calculateBreakdown: (subtotal: number, isTaxExempt?: boolean) => FinancialBreakdown;
  getTransactionsForTenant: (tenantId: TenantId) => PaymentTransaction[];
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

const STORAGE_KEYS: Record<TenantId, string> = {
  croe: 'croe_transactions',
  'circulo-militar': 'circulo_transactions',
};

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentTenant } = useTenant();

  // Load transactions from localStorage or seed
  const [tenantTransactions, setTenantTransactions] = useState<Record<TenantId, PaymentTransaction[]>>(() => {
    const loaded: Record<TenantId, PaymentTransaction[]> = {
      croe: [],
      'circulo-militar': [],
    };

    (['croe', 'circulo-militar'] as TenantId[]).forEach((tId) => {
      const key = STORAGE_KEYS[tId];
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          loaded[tId] = JSON.parse(stored);
        } else {
          // Seed with matching initial mock transactions
          const seeded = INITIAL_TRANSACTIONS.filter((tx) =>
            tId === 'croe'
              ? tx.rucInstitucion === '1790014298001' || tx.transactionId.includes('CROE')
              : tx.rucInstitucion === '1790025812001' || tx.transactionId.includes('CIR')
          );
          loaded[tId] = seeded;
          localStorage.setItem(key, JSON.stringify(seeded));
        }
      } catch (e) {
        console.error(`Error loading transactions for ${tId}:`, e);
        loaded[tId] = [];
      }
    });

    return loaded;
  });

  const [paymentState, setPaymentState] = useState<PaymentState>('IDLE');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('PAYPHONE');
  const [currentInitiation, setCurrentInitiation] = useState<PaymentInitiation | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<PaymentTransaction | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');

  const transactions = tenantTransactions[currentTenant.id] || [];

  const getTransactionsForTenant = useCallback(
    (tenantId: TenantId) => {
      return tenantTransactions[tenantId] || [];
    },
    [tenantTransactions]
  );

  const calculateBreakdown = useCallback(
    (subtotal: number, isTaxExempt: boolean = false): FinancialBreakdown => {
      const taxableSubtotal = Math.max(0, roundCurrency(subtotal));
      const vat = isTaxExempt ? 0 : calculateVat15(taxableSubtotal);
      const total = roundCurrency(taxableSubtotal + vat);
      return {
        subtotal: taxableSubtotal,
        militaryDiscount: 0,
        taxableSubtotal,
        vat,
        total,
        isComplimentary: total === 0,
      };
    },
    []
  );

  const initiatePayment = useCallback(
    (initiation: PaymentInitiation, defaultGateway: PaymentGateway = 'PAYPHONE') => {
      setCurrentInitiation(initiation);
      setSelectedGateway(defaultGateway);
      setPaymentState('INITIATED');
      setIsCheckoutModalOpen(true);
    },
    []
  );

  const closeCheckoutModal = useCallback(() => {
    if (paymentState === 'INITIATED') {
      currentInitiation?.onCancel?.();
    }
    setIsCheckoutModalOpen(false);
    if (paymentState !== 'APPROVED' && paymentState !== 'VOUCHER_ISSUED') {
      setPaymentState('IDLE');
      setCurrentInitiation(null);
    }
  }, [paymentState, currentInitiation]);

  const openReceiptModal = useCallback((transaction: PaymentTransaction) => {
    setCurrentTransaction(transaction);
    setIsReceiptModalOpen(true);
    setPaymentState('VOUCHER_ISSUED');
  }, []);

  const closeReceiptModal = useCallback(() => {
    setIsReceiptModalOpen(false);
    setPaymentState('IDLE');
    setCurrentInitiation(null);
  }, []);

  const resetPaymentState = useCallback(() => {
    setPaymentState('IDLE');
    setCurrentInitiation(null);
    setCurrentTransaction(null);
    setIsCheckoutModalOpen(false);
    setIsReceiptModalOpen(false);
    setProcessingStep('');
  }, []);

  const processPayment = useCallback(
    async (details: {
      gateway: PaymentGateway;
      method: PaymentMethod;
      phone?: string;
      cardBrand?: string;
      cardLast4?: string;
      installments?: number;
    }): Promise<PaymentTransaction> => {
      setPaymentState('PROCESSING');

      const steps = [
        'Cifrando canal TLS 1.3 con clave bancaria militar...',
        'Consultando pasarela bancaria y verificando token...',
        'Validando autorización con switch transaccional...',
        'Autorizando débito bancario y conciliación...',
        'Generando Comprobante Digital SRI (Clave de 49 dígitos)...',
      ];

      for (let i = 0; i < steps.length; i++) {
        setProcessingStep(steps[i]);
        // Short asynchronous pause to demonstrate cryptographic workflow
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      const activeInitiation = currentInitiation;
      const amount = activeInitiation?.amount ?? currentTenant.defaultSocio.montoCuotaMensual;
      const breakdown = calculateBreakdown(amount);

      const tenantCode = currentTenant.id === 'croe' ? 'CROE' : 'CIR';
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const transactionId = `TX-${tenantCode}-${new Date().getFullYear()}-${randomSeq}`;

      // Generate realistic authorization code
      const authPrefix = details.gateway === 'PAYPHONE' ? 'AUTH-PP' : 'AUTH-KSH';
      const authorizationCode = `${authPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;

      // Generate 49-digit SRI electronic access key
      const now = new Date();
      const accessKeySRI = generateSriAccessKey(currentTenant.ruc, now, randomSeq);

      const newTransaction: PaymentTransaction = {
        transactionId,
        authorizationCode,
        gateway: details.gateway,
        amount: breakdown.total,
        subtotal: breakdown.subtotal,
        vat: breakdown.vat,
        discount: breakdown.militaryDiscount,
        status: 'APPROVED',
        customerId: activeInitiation?.socioId || currentTenant.defaultSocio.cedula,
        customerName:
          activeInitiation?.socioName ||
          `${currentTenant.defaultSocio.grado} ${currentTenant.defaultSocio.nombres} ${currentTenant.defaultSocio.apellidos}`,
        customerEmail: currentTenant.defaultSocio.email,
        customerPhone: details.phone || currentTenant.defaultSocio.telefono,
        description:
          activeInitiation?.description ||
          `Aportación Mensual ${currentTenant.name} - Periodo 2026`,
        paymentMethod: details.method,
        cardBrand: details.cardBrand || (details.method === 'card' ? 'VISA' : undefined),
        cardLast4: details.cardLast4 || (details.method === 'card' ? '4500' : undefined),
        installments: details.installments || 1,
        rucInstitucion: currentTenant.ruc,
        institutionName: currentTenant.name,
        timestamp: now.toISOString(),
        accessKeySRI,
      };

      // Persist to state and localStorage
      const updatedList = [newTransaction, ...(tenantTransactions[currentTenant.id] || [])];
      const newAll = {
        ...tenantTransactions,
        [currentTenant.id]: updatedList,
      };

      setTenantTransactions(newAll);
      try {
        localStorage.setItem(STORAGE_KEYS[currentTenant.id], JSON.stringify(updatedList));
      } catch (err) {
        console.error('Error saving transaction to localStorage:', err);
      }

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors:
            currentTenant.id === 'croe'
              ? ['#8B1E24', '#D4AF37', '#1A1D20']
              : ['#1B365D', '#C8A051', '#3B82F6'],
        });
      } catch {
        // Safe fallback in test or headless environments
      }

      setCurrentTransaction(newTransaction);
      setPaymentState('APPROVED');
      activeInitiation?.onSuccess?.(newTransaction);

      // Transition to VOUCHER_ISSUED and display Digital Receipt Modal
      setTimeout(() => {
        setIsCheckoutModalOpen(false);
        setIsReceiptModalOpen(true);
        setPaymentState('VOUCHER_ISSUED');
      }, 500);

      return newTransaction;
    },
    [
      currentInitiation,
      currentTenant,
      calculateBreakdown,
      tenantTransactions,
    ]
  );

  return (
    <PaymentContext.Provider
      value={{
        paymentState,
        selectedGateway,
        setSelectedGateway,
        currentInitiation,
        currentTransaction,
        isCheckoutModalOpen,
        isReceiptModalOpen,
        processingStep,
        transactions,
        allTransactions: tenantTransactions,
        initiatePayment,
        processPayment,
        openReceiptModal,
        closeReceiptModal,
        closeCheckoutModal,
        resetPaymentState,
        calculateBreakdown,
        getTransactionsForTenant,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
