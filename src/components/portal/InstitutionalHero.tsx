import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTenant } from '../../context/TenantContext';
import { CroeShieldSvg } from '../badges/CroeShieldSvg';
import { CirculoSealSvg } from '../badges/CirculoSealSvg';
import { ActiveTab } from '../common/Navbar';
import {
  IdCard,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Award,
  Users,
  Compass,
  Building,
  ArrowRight,
  Sparkles,
  UtensilsCrossed
} from 'lucide-react';

interface InstitutionalHeroProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenGarita?: () => void;
}

export const InstitutionalHero: React.FC<InstitutionalHeroProps> = ({
  onNavigate,
  onOpenGarita
}) => {
  const { currentTenant, isCroe, switchTenant } = useTenant();
  const heroRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // GSAP Smooth Staggered Antigravity Entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance with soft physics
      gsap.from('.hero-badge', {
        y: -30,
        opacity: 0,
        scale: 0.85,
        duration: 1.1,
        ease: 'elastic.out(1, 0.75)'
      });

      gsap.from('.hero-title-group', {
        y: 25,
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
        ease: 'power3.out'
      });

      gsap.from('.hero-cta-btn', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        delay: 0.4,
        ease: 'power2.out'
      });

      // Stats ribbon staggered drop-in
      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          y: 35,
          opacity: 0,
          stagger: 0.08,
          duration: 0.8,
          delay: 0.5,
          ease: 'power3.out'
        });
      }

      // Feature cards domino entrance
      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.85,
          delay: 0.65,
          ease: 'power3.out'
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, [currentTenant.id]);

  const heroBackgroundStyle = isCroe
    ? 'linear-gradient(135deg, #4A0B0E 0%, #8B1E24 45%, #1A0406 100%)'
    : 'linear-gradient(135deg, #0A1628 0%, #1B365D 45%, #050B14 100%)';

  return (
    <div ref={heroRef as any} className="space-y-12 pb-16">
      {/* Hero Showcase Banner with Spatial Depth and Glassmorphism */}
      <section
        style={{ background: heroBackgroundStyle }}
        className="relative overflow-hidden text-white rounded-3xl shadow-2xl border border-white/15 mx-4 sm:mx-6 lg:mx-8 mt-6 px-6 sm:px-12 py-14 sm:py-20 transition-all duration-700 backdrop-blur-2xl"
      >
        {/* Subtle decorative background watermarks with slow floating motion */}
        <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none select-none animate-float-slow">
          {isCroe ? <CroeShieldSvg size={420} /> : <CirculoSealSvg size={440} />}
        </div>
        <div className="absolute -left-20 -bottom-20 opacity-5 pointer-events-none select-none animate-float-delayed">
          {isCroe ? <CroeShieldSvg size={360} /> : <CirculoSealSvg size={380} />}
        </div>

        {/* Ambient Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
          style={{
            background: isCroe
              ? 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.25), transparent 70%)'
              : 'radial-gradient(circle at 50% 30%, rgba(200, 160, 81, 0.22), transparent 70%)'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Institutional Badge with subtle floating elevation */}
          <div className="hero-badge mb-6 transform hover:scale-105 transition-transform duration-300 drop-shadow-2xl">
            {isCroe ? (
              <CroeShieldSvg size={120} glow />
            ) : (
              <CirculoSealSvg size={130} glow />
            )}
          </div>

          {/* Institutional Titles */}
          <div className="hero-title-group flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/25 text-xs font-semibold text-amber-300 mb-4 tracking-wider uppercase shadow-inner">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Portal Oficial Digital para Socios de las FF.AA.</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-white mb-4 leading-tight drop-shadow-lg">
              {currentTenant.name}
            </h1>

            <p className="text-lg sm:text-2xl font-serif text-amber-300/95 font-medium tracking-wide mb-6 italic">
              "{currentTenant.motto}"
            </p>

            <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed mb-10 font-normal opacity-95">
              Bienvenido al portal institucional unificado. Administre su credencial digital militar
              con código QR verificable, reserve cabañas andinas y canchas deportivas, gestione banquetes
              con control de inventario y liquide aportaciones con pasarelas 100% integradas.
            </p>
          </div>

          {/* Call to Actions Buttons with Weightless Hover */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            <button
              onClick={() => onNavigate('socio')}
              className="hero-cta-btn flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
            >
              <IdCard className="w-4 h-4" />
              <span>Ver Mi Carné Digital QR</span>
            </button>

            <button
              onClick={() => onNavigate('reservations')}
              className="hero-cta-btn flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/25 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              <CalendarDays className="w-4 h-4 text-amber-300" />
              <span>Reservar Cabañas & Canchas</span>
            </button>

            <button
              onClick={() => onNavigate('restaurant')}
              aria-label="Acceso Directo Servicio de Comedor y Banquetes"
              className="hero-cta-btn flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <UtensilsCrossed className="w-4 h-4 text-orange-400" />
              <span>Servicio Comedor & Eventos</span>
            </button>

            <button
              onClick={() => onNavigate('payment')}
              className="hero-cta-btn flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-white font-semibold text-sm border border-slate-700/80 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Pasarela Payphone / Kushki</span>
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Statistics Ribbon with Glassmorphism Panels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div
              className="p-3 rounded-xl text-white shadow-md shrink-0"
              style={{ backgroundColor: currentTenant.theme.primaryColor }}
            >
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {isCroe ? '1,480+' : '6,038'}
              </p>
              <p className="text-xs font-medium text-slate-500">Oficiales Activos & Socios</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div
              className="p-3 rounded-xl text-white shadow-md shrink-0"
              style={{ backgroundColor: currentTenant.theme.accentColor }}
            >
              <Building className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {currentTenant.facilities.length} Áreas
              </p>
              <p className="text-xs font-medium text-slate-500">Instalaciones Recreativas</p>
            </div>
          </div>

          <div
            onClick={onOpenGarita}
            className={`glass-panel p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              onOpenGarita ? 'cursor-pointer hover:border-emerald-400' : ''
            }`}
          >
            <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">99.4%</p>
              <p className="text-xs font-medium text-slate-500">Validación de Acceso en Garita</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="p-3 rounded-xl bg-slate-800 text-amber-400 shadow-md shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {isCroe ? '42 Años' : '108 Años'}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {isCroe ? 'Trayectoria y Servicio' : 'Tradición desde 1918'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Interactive Flow Cards with Weightless Floating */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Arquitectura de 11 Módulos Integrados
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 mt-2">
            Módulos Demostrables en la Reunión
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Flujos operativos interactivos para presentar al Directorio y cerrar la contratación.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Socio & Carné */}
          <div className="glass-panel rounded-2xl p-6 antigravity-card flex flex-col justify-between group">
            <div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: currentTenant.theme.primaryColor }}
              >
                <IdCard className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                Módulo 1 · Identidad
              </span>
              <h3 className="text-lg font-serif font-bold text-slate-900 mt-1 mb-2">
                Carné Digital QR 3D
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Expediente digital, familiares autorizados y carné con giro tridimensional,
                código QR criptográfico SHA-256 y simulador de garita militar.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('socio')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-sm"
                style={{ backgroundColor: currentTenant.theme.primaryColor }}
              >
                <span>Acceder a Carné</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Reservas */}
          <div className="glass-panel rounded-2xl p-6 antigravity-card flex flex-col justify-between group">
            <div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-950 mb-5 shadow-md group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: currentTenant.theme.accentColor }}
              >
                <CalendarDays className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                Módulo 2 · Hospedaje
              </span>
              <h3 className="text-lg font-serif font-bold text-slate-900 mt-1 mb-2">
                Reservas & Deportes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Disponibilidad en tiempo real para cabañas andinas, suites, canchas de tenis en arcilla,
                fútbol y pádel con tarifas militares y cero colisiones.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('reservations')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 transition-all hover:opacity-90 shadow-sm"
                style={{ backgroundColor: currentTenant.theme.accentColor }}
              >
                <span>Explorar Espacios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Restaurante & Inventario */}
          <div className="glass-panel rounded-2xl p-6 antigravity-card flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-110 transition-transform duration-300">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Módulo 3 · Economato
              </span>
              <h3 className="text-lg font-serif font-bold text-slate-900 mt-1 mb-2">
                Comedor & Kardex
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Turnos de Desayuno, Almuerzo, Cena y Eventos (PAX). Explosión de insumos en bodega,
                control de cubiertos/vajilla y carga de facturas SRI.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('restaurant')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-sm"
              >
                <span>Comedor & Inventario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Pasarela de Pagos */}
          <div className="glass-panel rounded-2xl p-6 antigravity-card flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 mb-5 shadow-md group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Módulo 4 · Recaudación
              </span>
              <h3 className="text-lg font-serif font-bold text-slate-900 mt-1 mb-2">
                Pasarela Payphone & SRI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cobro con Payphone (Ecuador) y Kushki 3DS, emisión de comprobante electrónico con
                clave de acceso SRI de 49 dígitos e IVA al 15%.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('payment')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-sm"
              >
                <span>Simular Recaudación</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Facilities Catalog Preview with Ambient Dark Depth */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel-dark text-white rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-amber-400 mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Instalaciones Destacadas de la Entidad</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Espacios Recreativos & Habitaciones {currentTenant.shortName}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('reservations')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Ver catálogo completo ({currentTenant.facilities.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTenant.facilities.slice(0, 3).map((facility) => (
              <div
                key={facility.id}
                onClick={() => onNavigate('reservations')}
                className="bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/70 hover:border-amber-400/60 transition-all duration-300 cursor-pointer group hover:-translate-y-1.5 hover:shadow-2xl"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={facility.imageUrl}
                    alt={facility.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-amber-300 border border-white/10">
                    {facility.subcategory}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Hasta {facility.capacity} personas
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Socio: ${facility.memberPrice} / {facility.unit}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-serif font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                    {facility.name}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {facility.description}
                  </p>
                  <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {facility.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Tenant White Label Callout for Executives */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-amber-200/60 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shrink-0 shadow-md mt-1">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-slate-900 text-lg">
                Demostración de Marca Blanca Multi-Tenant en Vivo
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
                Esta solución comparte una arquitectura técnica escalable de alto rendimiento,
                pero mantiene una separación visual y de datos absoluta entre el <strong>CROE</strong> y el <strong>Círculo Militar del Ecuador</strong>.
                Pruebe alternar entre ambas entidades con el selector superior o la tecla <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-slate-300 rounded shadow-xs font-bold">Alt + T</kbd>.
              </p>
            </div>
          </div>

          <button
            onClick={switchTenant}
            className="shrink-0 px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Alternar a {isCroe ? 'Círculo Militar' : 'CROE'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </section>
    </div>
  );
};
