import { describe, it, expect } from 'vitest';
import { TablewareAuditItem } from '../../src/types/inventory';

describe('Tier 2: Boundary Domain 2.8 — Tableware Loss & Breakage Calculations', () => {
  // Helper simulating the core settlement calculation logic
  function calculateTablewareSettlement(
    items: {
      itemCode: string;
      assignedQty: number;
      returnedIntactQty: number;
      brokenOrLostQty: number;
      unitReplacementCost: number;
    }[]
  ): { audits: TablewareAuditItem[]; totalLossCost: number; isValid: boolean } {
    let isValid = true;
    let totalLossCost = 0;

    const audits: TablewareAuditItem[] = items.map((item) => {
      if (item.returnedIntactQty + item.brokenOrLostQty > item.assignedQty) {
        isValid = false;
      }
      const broken = Math.max(0, item.brokenOrLostQty);
      const lossCost = Math.round(broken * item.unitReplacementCost * 100) / 100;
      totalLossCost += lossCost;

      return {
        itemCode: item.itemCode,
        name: `Item ${item.itemCode}`,
        assignedQty: item.assignedQty,
        returnedIntactQty: item.returnedIntactQty,
        brokenOrLostQty: broken,
        unitReplacementCost: item.unitReplacementCost,
        totalLossCost: lossCost,
      };
    });

    return {
      audits,
      totalLossCost: Math.round(totalLossCost * 100) / 100,
      isValid,
    };
  }

  it('T2-MLC-01: 100% Intact Tableware Return Yields Zero ($0.00) Replacement Charge', () => {
    const galaEventItems = [
      {
        itemCode: 'MEN-PLA-01',
        assignedQty: 150,
        returnedIntactQty: 150,
        brokenOrLostQty: 0,
        unitReplacementCost: 6.20,
      },
      {
        itemCode: 'MEN-COP-03',
        assignedQty: 200,
        returnedIntactQty: 200,
        brokenOrLostQty: 0,
        unitReplacementCost: 3.80,
      },
    ];

    const result = calculateTablewareSettlement(galaEventItems);

    expect(result.isValid).toBe(true);
    expect(result.totalLossCost).toBe(0.00);
    result.audits.forEach((audit) => {
      expect(audit.brokenOrLostQty).toBe(0);
      expect(audit.totalLossCost).toBe(0.00);
    });
  });

  it('T2-MLC-02: Partial Breakage Calculates Exact Proportional Financial Charge', () => {
    const galaEventItems = [
      {
        itemCode: 'MEN-PLA-01',
        assignedQty: 100,
        returnedIntactQty: 96,
        brokenOrLostQty: 4, // 4 * $6.20 = $24.80
        unitReplacementCost: 6.20,
      },
      {
        itemCode: 'MEN-CUB-02',
        assignedQty: 100,
        returnedIntactQty: 98,
        brokenOrLostQty: 2, // 2 * $4.50 = $9.00
        unitReplacementCost: 4.50,
      },
      {
        itemCode: 'MEN-COP-03',
        assignedQty: 150,
        returnedIntactQty: 142,
        brokenOrLostQty: 8, // 8 * $3.80 = $30.40
        unitReplacementCost: 3.80,
      },
    ];

    const result = calculateTablewareSettlement(galaEventItems);

    expect(result.isValid).toBe(true);
    expect(result.audits[0].totalLossCost).toBe(24.80);
    expect(result.audits[1].totalLossCost).toBe(9.00);
    expect(result.audits[2].totalLossCost).toBe(30.40);
    // Total: 24.80 + 9.00 + 30.40 = 64.20
    expect(result.totalLossCost).toBe(64.20);
  });

  it('T2-MLC-03: Flags Boundary Invalidation When Returned Count Exceeds Dispatched Count', () => {
    const anomalousItems = [
      {
        itemCode: 'MEN-COP-03',
        assignedQty: 100,
        returnedIntactQty: 105, // Impossible: returned 105 out of 100 assigned
        brokenOrLostQty: 0,
        unitReplacementCost: 3.80,
      },
    ];

    const result = calculateTablewareSettlement(anomalousItems);
    expect(result.isValid).toBe(false);
  });
});
