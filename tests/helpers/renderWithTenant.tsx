import React, { ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { TenantProvider, useTenant } from '../../src/context/TenantContext';
import { TenantId } from '../../src/types/tenant';

interface WrapperProps {
  children: ReactNode;
  initialTenant?: TenantId;
}

export const TestTenantWrapper: React.FC<WrapperProps> = ({ children, initialTenant = 'croe' }) => {
  if (initialTenant) {
    try {
      localStorage.setItem('plataforma_militar_tenant_id', initialTenant);
    } catch {
      // ignore
    }
  }
  return <TenantProvider>{children}</TenantProvider>;
};

export function renderWithTenant(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialTenant?: TenantId }
): RenderResult {
  const { initialTenant = 'croe', ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <TestTenantWrapper initialTenant={initialTenant}>{children}</TestTenantWrapper>
    ),
    ...renderOptions,
  });
}

export { useTenant };
