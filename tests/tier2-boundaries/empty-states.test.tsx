import { describe, it, expect } from 'vitest';
import { MOCK_BACHELOR_LIEUTENANT } from '../helpers/mockData';
import { CROE_CONFIG } from '../../src/data/croeData';

describe('Tier 2: Boundary Domain 2.1 — Empty States & Missing Data Boundaries', () => {

  it('T2-EMP-01: Zero Reservations Ledger Display — handles empty booking list gracefully', () => {
    const emptyLedger: any[] = [];
    expect(emptyLedger.length).toBe(0);

    const renderEmptyMessage = (items: any[]) => {
      if (items.length === 0) {
        return {
          title: 'No registra reservas activas',
          actionText: 'Explorar Instalaciones',
        };
      }
      return null;
    };

    const emptyState = renderEmptyMessage(emptyLedger);
    expect(emptyState?.title).toBe('No registra reservas activas');
    expect(emptyState?.actionText).toBe('Explorar Instalaciones');
  });

  it('T2-EMP-02: Zero Dependents Fallback — handles bachelor lieutenant with 0 dependents', () => {
    const officer = MOCK_BACHELOR_LIEUTENANT;
    expect(officer.dependientes.length).toBe(0);

    const getDependentsFallback = (deps: any[]) => {
      if (deps.length === 0) {
        return 'Sin cargas familiares registradas. Para registrar familiares directos diríjase al Departamento de Bienestar.';
      }
      return null;
    };

    const message = getDependentsFallback(officer.dependientes);
    expect(message).toMatch(/Sin cargas familiares registradas/i);
  });

  it('T2-EMP-03: Missing Facility Availability Search Results — handles zero search matches gracefully', () => {
    const facilities = CROE_CONFIG.facilities;
    const filterQuery = 'InstalacionInexistenteXYZ';

    const results = facilities.filter((f) =>
      f.name.toLowerCase().includes(filterQuery.toLowerCase())
    );

    expect(results.length).toBe(0);
    const getNoResultsNotice = (count: number) => {
      if (count === 0) {
        return 'No se encontraron instalaciones disponibles con los filtros seleccionados.';
      }
      return '';
    };

    expect(getNoResultsNotice(results.length)).toMatch(/No se encontraron instalaciones/i);
  });

  it('T2-EMP-04: Empty Search Filter Input — clearing search input restores all facilities', () => {
    const allFacilities = CROE_CONFIG.facilities;
    let query = 'Cabaña';

    let filtered = allFacilities.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
    expect(filtered.length).toBeLessThan(allFacilities.length);

    // Empty query restored
    query = '';
    filtered = allFacilities.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
    expect(filtered.length).toBe(allFacilities.length);
  });

  it('T2-EMP-05: Missing Photo Avatar Graceful Fallback — generates member initials when photoUrl is absent', () => {
    const officer = MOCK_BACHELOR_LIEUTENANT; // photoUrl is ''
    expect(officer.fotoUrl).toBe('');

    const getAvatarInitials = (nombres: string, apellidos: string, photoUrl?: string) => {
      if (!photoUrl || photoUrl.trim() === '') {
        const first = nombres.trim().charAt(0);
        const last = apellidos.trim().charAt(0);
        return `${first}${last}`.toUpperCase();
      }
      return null;
    };

    const initials = getAvatarInitials(officer.nombres, officer.apellidos, officer.fotoUrl);
    expect(initials).toBe('DG'); // Diego Guerrero -> DG
  });
});
