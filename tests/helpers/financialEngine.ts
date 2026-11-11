/**
 * SRI Financial and Tax Calculation Utilities (Ecuador 15% IVA)
 */

export const ECUADOR_IVA_RATE = 0.15;

/**
 * Rounds to exactly 2 decimal places using standard financial round
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates 15% IVA according to SRI standard
 */
export function calculateVat15(taxableBase: number): number {
  if (taxableBase <= 0) return 0;
  return roundCurrency(taxableBase * ECUADOR_IVA_RATE);
}

/**
 * Formats a numeric USD amount to currency string (e.g. $1,250.00)
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
 * Computes complete itemized billing breakdown
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
 * Generates simulated 49-digit SRI electronic invoice access key
 */
export function generateSriAccessKey(ruc: string, date: Date, seqNum: number): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear());
  const dateStr = `${d}${m}${y}`;
  const docType = '01'; // Factura
  const paddedRuc = ruc.padEnd(13, '0').slice(0, 13);
  const env = '1'; // 1: Pruebas / 2: Producción
  const est = '001001';
  const seq = String(seqNum).padStart(9, '0');
  const numericCode = '12345678';
  const emissionType = '1'; // Normal

  const partialKey = `${dateStr}${docType}${paddedRuc}${env}${est}${seq}${numericCode}${emissionType}`;
  // Modulo 11 check digit
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
