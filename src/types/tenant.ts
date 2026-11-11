import { SocioProfile } from './socio';
import { Facility } from './reservation';

export type TenantId = 'croe' | 'circulo-militar';

export interface TenantTheme {
  primaryColor: string;
  primaryDark: string;
  primaryLight: string;
  accentColor: string;
  accentLight: string;
  textColor: string;
  bgSubtle: string;
  gradientHero: string;
  badgeBg: string;
  badgeText: string;
}

export interface TenantContact {
  address: string;
  city: string;
  phone: string;
  email: string;
  hours: string;
}

export interface TenantConfig {
  id: TenantId;
  name: string;
  shortName: string;
  legalEntity: string;
  ruc: string;
  motto: string;
  foundedYear?: string;
  domain: string;
  theme: TenantTheme;
  contact: TenantContact;
  facilities: Facility[];
  defaultSocio: SocioProfile;
}
