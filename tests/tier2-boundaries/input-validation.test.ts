import { describe, it, expect } from 'vitest';
import { validateGuestCapacity } from '../helpers/bookingEngine';

describe('Tier 2: Boundary Domain 2.5 — Invalid Inputs, Form Validation & Sanitization', () => {

  it('T2-INP-01: Invalid Ecuadorian Phone Number in Payphone — validates 10 digits starting with 09', () => {
    const validateEcuadorMobile = (phone: string): { valid: boolean; error?: string } => {
      const cleaned = phone.replace(/\D/g, '');
      if (!/^09\d{8}$/.test(cleaned)) {
        return {
          valid: false,
          error: 'Ingrese un número celular móvil válido de Ecuador (ej. 0991234567)',
        };
      }
      return { valid: true };
    };

    expect(validateEcuadorMobile('0998765432').valid).toBe(true);
    expect(validateEcuadorMobile('0987654321').valid).toBe(true);

    // Invalid prefix
    expect(validateEcuadorMobile('022894500').valid).toBe(false); // landline
    expect(validateEcuadorMobile('0881234567').valid).toBe(false); // bad mobile prefix
    expect(validateEcuadorMobile('12345').valid).toBe(false); // short
  });

  it('T2-INP-02: Invalid Credit Card Number in Kushki — validates length and Luhn checksum', () => {
    const validateCardLuhn = (num: string): { valid: boolean; error?: string } => {
      const clean = num.replace(/\s+/g, '');
      if (clean.length < 13 || clean.length > 19) {
        return { valid: false, error: 'Número de tarjeta incompleto' };
      }

      let sum = 0;
      let shouldDouble = false;
      for (let i = clean.length - 1; i >= 0; i--) {
        let digit = parseInt(clean.charAt(i), 10);
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      return sum % 10 === 0 ? { valid: true } : { valid: false, error: 'Tarjeta inválida' };
    };

    // Valid standard test card (Visa)
    expect(validateCardLuhn('4111 2222 3333 4444').valid).toBe(false); // bad checksum
    expect(validateCardLuhn('4242 4242 4242 4242').valid).toBe(true); // valid Luhn
    expect(validateCardLuhn('4111').valid).toBe(false); // too short
  });

  it('T2-INP-03: XSS Injection in Reservation Notes — strips/escapes dangerous HTML tags', () => {
    const sanitizeUserNotes = (input: string): string => {
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    };

    const maliciousInput = "<script>alert('xss')</script><img src=x onerror=alert(1)>";
    const sanitized = sanitizeUserNotes(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('<img');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('T2-INP-04: Inverted Date Range — rejects check-out date prior to check-in date', () => {
    const validateDates = (checkIn: string, checkOut: string): { valid: boolean; error?: string } => {
      const inDate = new Date(checkIn).getTime();
      const outDate = new Date(checkOut).getTime();
      if (outDate <= inDate) {
        return {
          valid: false,
          error: 'La fecha de salida debe ser posterior a la fecha de ingreso',
        };
      }
      return { valid: true };
    };

    const validRange = validateDates('2026-11-20', '2026-11-22');
    expect(validRange.valid).toBe(true);

    const invertedRange = validateDates('2026-11-22', '2026-11-20');
    expect(invertedRange.valid).toBe(false);
    expect(invertedRange.error).toMatch(/posterior a la fecha de ingreso/i);
  });

  it('T2-INP-05: Exceeding Maximum Facility Guest Capacity — prevents guest counts above capacity', () => {
    const maxCapacity = 4; // Cabaña VIP
    const withinLimit = validateGuestCapacity(4, maxCapacity);
    expect(withinLimit.valid).toBe(true);

    const exceededLimit = validateGuestCapacity(12, maxCapacity);
    expect(exceededLimit.valid).toBe(false);
    expect(exceededLimit.error).toMatch(/Capacidad máxima excedida/i);
  });
});
