import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Tier 1: Feature 1.7 — Technical Plan Document Existence & Completeness (PLAN_EJECUCION_TECNICA.md)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const planDocPath = path.join(rootDir, 'PLAN_EJECUCION_TECNICA.md');

  it('T1-DOC-01: File Existence in Project Root — exists and size exceeds 15,000 bytes', () => {
    expect(fs.existsSync(planDocPath)).toBe(true);
    const stats = fs.statSync(planDocPath);
    expect(stats.size).toBeGreaterThan(15000);
  });

  it('T1-DOC-02: Entity-Relationship Model Completeness — covers military schema entities', () => {
    const content = fs.readFileSync(planDocPath, 'utf8');
    const entities = [
      /members|socios/i,
      /military_ranks|grados|rangos/i,
      /dependents|dependientes/i,
      /reservations|reservas/i,
      /payment_transactions|transacciones|pagos/i,
      /agreements|convenios/i,
    ];
    for (const pattern of entities) {
      expect(content).toMatch(pattern);
    }
  });

  it('T1-DOC-03: Multi-Tenant Architecture Specification — documents isolation and RLS security', () => {
    const content = fs.readFileSync(planDocPath, 'utf8');
    expect(content).toMatch(/multi-tenant/i);
    expect(content).toMatch(/tenant_id/i);
    expect(content).toMatch(/Row Level Security|RLS/i);
  });

  it('T1-DOC-04: Ecuadorian Payment Gateways Architecture — documents Payphone, Kushki and webhooks', () => {
    const content = fs.readFileSync(planDocPath, 'utf8');
    expect(content).toMatch(/payphone/i);
    expect(content).toMatch(/kushki/i);
    expect(content).toMatch(/webhook/i);
    expect(content).toMatch(/sri/i);
  });

  it('T1-DOC-05: 11+2 Module Roadmap & LOPDP Compliance — covers full roadmap and privacy law', () => {
    const content = fs.readFileSync(planDocPath, 'utf8');
    expect(content).toMatch(/M1/i);
    expect(content).toMatch(/M11/i);
    expect(content).toMatch(/T1/i);
    expect(content).toMatch(/T2/i);
    expect(content).toMatch(/lopdp/i);
  });
});
