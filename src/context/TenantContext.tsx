import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TenantConfig, TenantId } from '../types/tenant';
import { CROE_CONFIG } from '../data/croeData';
import { CIRCULO_CONFIG } from '../data/circuloData';

interface TenantContextType {
  currentTenant: TenantConfig;
  setTenant: (id: TenantId) => void;
  switchTenant: () => void;
  isCroe: boolean;
  isCirculo: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANT_STORAGE_KEY = 'plataforma_militar_tenant_id';

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState<TenantId>(() => {
    try {
      const saved = localStorage.getItem(TENANT_STORAGE_KEY);
      if (saved === 'croe' || saved === 'circulo-militar') {
        return saved;
      }
    } catch {
      // Ignore storage access error
    }
    return 'croe';
  });

  const currentTenant = tenantId === 'croe' ? CROE_CONFIG : CIRCULO_CONFIG;
  const isCroe = tenantId === 'croe';
  const isCirculo = tenantId === 'circulo-militar';

  const setTenant = useCallback((id: TenantId) => {
    setTenantId(id);
    try {
      localStorage.setItem(TENANT_STORAGE_KEY, id);
    } catch {
      // Ignore storage error
    }
  }, []);

  const switchTenant = useCallback(() => {
    setTenant(tenantId === 'croe' ? 'circulo-militar' : 'croe');
  }, [tenantId, setTenant]);

  // Inject CSS Variables and attribute to root element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-tenant', currentTenant.id);
    root.style.setProperty('--color-primary', currentTenant.theme.primaryColor);
    root.style.setProperty('--color-primary-dark', currentTenant.theme.primaryDark);
    root.style.setProperty('--color-primary-light', currentTenant.theme.primaryLight);
    root.style.setProperty('--color-accent', currentTenant.theme.accentColor);
    root.style.setProperty('--color-accent-light', currentTenant.theme.accentLight);
    root.style.setProperty('--color-neutral-dark', currentTenant.theme.textColor);
    root.style.setProperty('--color-bg-subtle', currentTenant.theme.bgSubtle);

    document.title = `${currentTenant.shortName} | Plataforma Institucional`;
  }, [currentTenant]);

  // Listen for Alt+T keyboard shortcut to switch tenant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        switchTenant();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [switchTenant]);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        setTenant,
        switchTenant,
        isCroe,
        isCirculo
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
