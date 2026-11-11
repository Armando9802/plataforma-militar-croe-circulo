import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { CroeShieldSvg } from '../badges/CroeShieldSvg';
import { CirculoSealSvg } from '../badges/CirculoSealSvg';
import {
  Home,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Menu,
  X,
  ShieldAlert,
  ChevronRight,
  UtensilsCrossed,
  PackageCheck
} from 'lucide-react';

export type ActiveTab = 'home' | 'socio' | 'reservations' | 'restaurant' | 'inventory' | 'payment';
export type UserRole = 'socio' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenGarita?: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenGarita,
  currentRole,
  onRoleChange,
}) => {
  const { currentTenant, isCroe } = useTenant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // All modules available
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Inicio', icon: Home },
    { id: 'socio' as ActiveTab, label: 'Portal del Socio & Carné', icon: UserCheck },
    { id: 'reservations' as ActiveTab, label: 'Reservas & Deportes', icon: CalendarCheck },
    { id: 'restaurant' as ActiveTab, label: 'Restaurante & Eventos', icon: UtensilsCrossed },
    { id: 'inventory' as ActiveTab, label: 'Inventario & Economato', icon: PackageCheck },
    { id: 'payment' as ActiveTab, label: 'Pasarela de Pagos (SRI)', icon: CreditCard },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Institutional Brand Left */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative">
              {isCroe ? (
                <CroeShieldSvg size={52} glow className="group-hover:scale-105 transition-transform" />
              ) : (
                <CirculoSealSvg size={54} glow className="group-hover:scale-105 transition-transform" />
              )}
            </div>
            <div className="flex flex-col min-w-0 max-w-[200px] sm:max-w-[280px]">
              <div className="flex items-center gap-2">
                <span
                  className="font-serif font-extrabold text-sm sm:text-base tracking-wide truncate"
                  style={{ color: currentTenant.theme.primaryColor }}
                >
                  {currentTenant.name}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium tracking-normal text-slate-500 uppercase flex items-center gap-1.5 truncate">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: currentTenant.theme.accentColor }}
                />
                <span className="truncate">"{currentTenant.motto}"</span>
                {currentTenant.foundedYear && (
                  <span className="text-slate-400 font-sans shrink-0">· Est. {currentTenant.foundedYear}</span>
                )}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: currentTenant.theme.primaryColor,
                          boxShadow: `0 4px 12px ${currentTenant.theme.primaryColor}33`,
                        }
                      : {}
                  }
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Quick Socio Status & Action */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Role Switcher Pill: Socio vs Administrador */}
            <div
              className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-inner"
              role="group"
              aria-label="Perfil de usuario"
            >
              <button
                type="button"
                onClick={() => {
                  onRoleChange('socio');
                  if (activeTab === 'inventory') onTabChange('home');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentRole === 'socio'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                👤 Vista Socio
              </button>
              <button
                type="button"
                onClick={() => {
                  onRoleChange('admin');
                  if (activeTab === 'socio') onTabChange('inventory');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ⚙️ Administración
              </button>
            </div>

            {onOpenGarita && currentRole === 'admin' && (
              <button
                onClick={onOpenGarita}
                title="Abrir simulador de garita de acceso militar"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simular Garita</span>
              </button>
            )}

            {/* Officer Profile Pill */}
            <div
              onClick={() => handleNavClick('socio')}
              className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <img
                src={currentTenant.defaultSocio.fotoUrl}
                alt={currentTenant.defaultSocio.nombres}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400"
              />
              <div className="text-left leading-tight hidden xl:block">
                <span className="block text-[11px] font-bold text-slate-900 truncate max-w-[130px]">
                  {currentTenant.defaultSocio.grado} {currentTenant.defaultSocio.apellidos.split(' ')[0]}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {currentRole === 'admin' ? 'Director TIC' : 'Socio al Día'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => onRoleChange(currentRole === 'socio' ? 'admin' : 'socio')}
              className="px-2 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
            >
              {currentRole === 'admin' ? '⚙️ Admin' : '👤 Socio'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                style={
                  isActive
                    ? { backgroundColor: currentTenant.theme.primaryColor }
                    : {}
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={currentTenant.defaultSocio.fotoUrl}
                alt={currentTenant.defaultSocio.nombres}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400"
              />
              <div className="text-left text-xs">
                <p className="font-bold text-slate-800">{currentTenant.defaultSocio.grado}</p>
                <p className="text-[11px] text-slate-500">{currentTenant.defaultSocio.nombres}</p>
              </div>
            </div>
            {onOpenGarita && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGarita();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white"
              >
                Garita QR
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
