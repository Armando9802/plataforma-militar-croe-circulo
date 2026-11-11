import React, { useState, useMemo } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useInventory } from '../../context/InventoryContext';
import { ShiftType, EventType, RoomSetup, BanquetAdditionalService } from '../../types/restaurant';
import {
  CROE_SHIFT_INFO,
  CIRCULO_SHIFT_INFO,
  DINING_HALLS_DATA,
  MENU_OPTIONS_DATA,
  BANQUET_ADDITIONAL_SERVICES,
} from '../../data/mockRestaurant';
import { calculateSupplyExplosion } from '../../utils/recipeExplosion';
import {
  UtensilsCrossed,
  Coffee,
  Utensils,
  Moon,
  Users,
  Clock,
  Sparkles,
  CreditCard,
  CheckCircle2,
  PackageCheck,
  Info,
} from 'lucide-react';

interface RestaurantViewProps {
  onNavigateToPayment?: (bookingData: any) => void;
}

export const RestaurantView: React.FC<RestaurantViewProps> = ({ onNavigateToPayment }) => {
  const { currentTenant, isCroe } = useTenant();
  const { deductShiftConsumption, deductEventConsumption } = useInventory();

  // Mode: 'shifts' (Turnos Diarios) vs 'banquets' (Eventos & Banquetes)
  const [activeTab, setActiveTab] = useState<'shifts' | 'banquets'>('shifts');

  // ==========================================
  // STATE: SHIFTS (Turnos Diarios)
  // ==========================================
  const shiftList = isCroe ? CROE_SHIFT_INFO : CIRCULO_SHIFT_INFO;
  const [selectedShift, setSelectedShift] = useState<ShiftType>('almuerzo');
  const [shiftPax, setShiftPax] = useState<number>(45);
  const [shiftDate, setShiftDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isMemberPrice, setIsMemberPrice] = useState<boolean>(true);
  const [shiftFeedback, setShiftFeedback] = useState<string | null>(null);

  const currentShiftDetails = useMemo(() => {
    return shiftList.find((s) => s.type === selectedShift) || shiftList[0];
  }, [shiftList, selectedShift]);

  // Financials for shift
  const shiftSubtotal = useMemo(() => {
    const pricePerPax = isMemberPrice
      ? currentShiftDetails.memberPrice
      : currentShiftDetails.guestPrice;
    return Math.round(pricePerPax * shiftPax * 100) / 100;
  }, [currentShiftDetails, shiftPax, isMemberPrice]);

  const shiftVat = useMemo(() => {
    return Math.round(shiftSubtotal * 0.15 * 100) / 100;
  }, [shiftSubtotal]);

  const shiftTotal = useMemo(() => {
    return Math.round((shiftSubtotal + shiftVat) * 100) / 100;
  }, [shiftSubtotal, shiftVat]);

  // Live supply explosion for shift
  const shiftExplosion = useMemo(() => {
    return calculateSupplyExplosion({
      serviceType: 'shift',
      shiftType: selectedShift,
      paxCount: shiftPax,
    });
  }, [selectedShift, shiftPax]);

  // Handle register & deduct shift
  const handleExecuteShift = () => {
    const ok = deductShiftConsumption(
      selectedShift,
      shiftPax,
      `TURNO-${selectedShift.toUpperCase()}-${shiftPax}PAX`,
      'Chef Ejecutivo Castrense'
    );
    if (ok) {
      setShiftFeedback(
        `¡Turno de ${currentShiftDetails.label} ejecutado exitosamente para ${shiftPax} PAX! Se descontaron las existencias de alimentos, bebidas y descartables en el economato central y se registró el asiento en el Kardex.`
      );
    }
  };

  // ==========================================
  // STATE: BANQUETS (Eventos Institucionales)
  // ==========================================
  const tenantHalls = useMemo(() => {
    return DINING_HALLS_DATA.filter((h) => h.tenantId === currentTenant.id && h.supportsEvents);
  }, [currentTenant.id]);

  const [selectedHallId, setSelectedHallId] = useState<string>(tenantHalls[0]?.id || 'croe-hall-sol');
  const [banquetEventType, setBanquetEventType] = useState<EventType>('banquete_gala');
  const [banquetPax, setBanquetPax] = useState<number>(100);
  const [roomSetup, setRoomSetup] = useState<RoomSetup>('banquete_mesas');
  const [selectedMenuId, setSelectedMenuId] = useState<string>(MENU_OPTIONS_DATA[0].id);
  const [services, setServices] = useState<BanquetAdditionalService[]>(BANQUET_ADDITIONAL_SERVICES);
  const [banquetDate, setBanquetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [banquetFeedback, setBanquetFeedback] = useState<string | null>(null);

  const selectedHall = useMemo(() => {
    return DINING_HALLS_DATA.find((h) => h.id === selectedHallId) || DINING_HALLS_DATA[0];
  }, [selectedHallId]);

  const selectedMenu = useMemo(() => {
    return MENU_OPTIONS_DATA.find((m) => m.id === selectedMenuId) || MENU_OPTIONS_DATA[0];
  }, [selectedMenuId]);

  const toggleService = (srvId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.serviceId === srvId ? { ...s, selected: !s.selected } : s))
    );
  };

  // Financials for banquet
  const hallRentalCost = selectedHall.baseRentalMember;
  const cateringCost = selectedMenu.memberPricePerPax * banquetPax;
  const servicesCost = services
    .filter((s) => s.selected)
    .reduce((sum, s) => sum + s.price, 0);

  const banquetSubtotal = hallRentalCost + cateringCost + servicesCost;
  const banquetVat = Math.round(banquetSubtotal * 0.15 * 100) / 100;
  const banquetTotal = Math.round((banquetSubtotal + banquetVat) * 100) / 100;

  // Live supply explosion for banquet
  const banquetExplosion = useMemo(() => {
    return calculateSupplyExplosion({
      serviceType: 'event',
      eventType: banquetEventType,
      paxCount: banquetPax,
    });
  }, [banquetEventType, banquetPax]);

  // Handle register & dispatch banquet
  const handleExecuteBanquet = () => {
    const ok = deductEventConsumption(
      banquetEventType,
      banquetPax,
      `BANQUETE-${banquetEventType.toUpperCase()}-${banquetPax}PAX`,
      'Mayordomo de Gala Castrense'
    );
    if (ok) {
      setBanquetFeedback(
        `¡Banquete ${selectedMenu.name} despachado exitosamente para ${banquetPax} PAX! Se asignó el menaje protocolar a circulación en salón y se descontaron los insumos consumibles en el Kardex.`
      );
    }
  };

  const handleCheckoutBanquet = () => {
    if (onNavigateToPayment) {
      onNavigateToPayment({
        id: `EVT-${currentTenant.id.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        socioId: currentTenant.defaultSocio.id,
        socioName: `${currentTenant.defaultSocio.grado} ${currentTenant.defaultSocio.nombres} ${currentTenant.defaultSocio.apellidos}`,
        facilityName: `${selectedHall.name} - ${selectedMenu.name} (${banquetPax} PAX)`,
        total: banquetTotal,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="p-2.5 rounded-xl text-white shadow-md"
              style={{ backgroundColor: currentTenant.theme.primaryColor }}
            >
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl text-slate-900">
                Restaurante, Turnos de Comedor & Banquetes
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Gestión militar de turnos diarios y eventos institucionales con explosión automática de existencias — {currentTenant.name}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setActiveTab('shifts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'shifts'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Turnos Diarios de Comedor</span>
          </button>

          <button
            onClick={() => setActiveTab('banquets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'banquets'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Eventos & Banquetes Protocolarios</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: TURNOS DIARIOS DE COMEDOR                     */}
      {/* ======================================================== */}
      {activeTab === 'shifts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shift Selector & Configuration */}
          <div className="lg:col-span-7 space-y-6">
            {/* Shift Cards */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                Seleccione el Turno de Servicio:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {shiftList.map((shift) => {
                  const isSelected = selectedShift === shift.type;
                  const Icon =
                    shift.type === 'desayuno'
                      ? Coffee
                      : shift.type === 'almuerzo'
                      ? Utensils
                      : Moon;

                  return (
                    <div
                      key={shift.type}
                      onClick={() => {
                        setSelectedShift(shift.type);
                        setShiftFeedback(null);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-400'
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`p-2 rounded-xl ${
                            isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {shift.hours}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-slate-900 text-sm">{shift.label}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {shift.description}
                      </p>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-emerald-700 font-bold">
                          ${shift.memberPrice.toFixed(2)} Socio
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ${shift.guestPrice.toFixed(2)} Invitado
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PAX Selector & Date */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                Configuración del Turno & Comensales (PAX)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Fecha del Servicio:
                  </label>
                  <input
                    type="date"
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Tipo de Tarifa:
                  </label>
                  <div className="flex rounded-lg border border-slate-300 overflow-hidden text-xs">
                    <button
                      onClick={() => setIsMemberPrice(true)}
                      className={`flex-1 py-2 font-semibold ${
                        isMemberPrice ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      Socio Militar (Subsidio)
                    </button>
                    <button
                      onClick={() => setIsMemberPrice(false)}
                      className={`flex-1 py-2 font-semibold ${
                        !isMemberPrice ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      Invitado General
                    </button>
                  </div>
                </div>
              </div>

              {/* PAX Live Slider and Presets */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Comensales Declarados (PAX):</span>
                  <span className="font-serif font-black text-lg text-amber-700">
                    {shiftPax} Comensales
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={shiftPax}
                  onChange={(e) => setShiftPax(parseInt(e.target.value) || 5)}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5 PAX (Mesa familiar)</span>
                  <span>45 PAX (Ración Guarnición)</span>
                  <span>85 PAX (Comedor Completo)</span>
                  <span>150 PAX (Tope)</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Atajos:</span>
                  {[12, 25, 45, 85].map((p) => (
                    <button
                      key={p}
                      onClick={() => setShiftPax(p)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${
                        shiftPax === p
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {p} PAX
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shift Financial Summary */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs uppercase font-bold text-slate-400">
                  Liquidación Económica del Turno (SRI Ecuador)
                </span>
                <span className="text-[11px] text-amber-400 font-mono">Tarifa 15% IVA</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>
                    Raciones ({shiftPax} PAX x ${isMemberPrice ? currentShiftDetails.memberPrice.toFixed(2) : currentShiftDetails.guestPrice.toFixed(2)}):
                  </span>
                  <span className="font-mono font-bold">${shiftSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA SRI (15% Legal Vigente):</span>
                  <span className="font-mono font-bold">${shiftVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white border-t border-slate-800 pt-2">
                  <span>Total Facturado del Turno:</span>
                  <span className="font-serif font-black text-amber-400">
                    ${shiftTotal.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleExecuteShift}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Registrar Turno y Descontar Existencias</span>
                </button>

                {onNavigateToPayment && (
                  <button
                    onClick={() =>
                      onNavigateToPayment({
                        id: `RSV-SHF-${Date.now().toString().slice(-4)}`,
                        socioId: currentTenant.defaultSocio.id,
                        socioName: `${currentTenant.defaultSocio.grado} ${currentTenant.defaultSocio.nombres} ${currentTenant.defaultSocio.apellidos}`,
                        facilityName: `Turno ${currentShiftDetails.label} (${shiftPax} PAX)`,
                        total: shiftTotal,
                      })
                    }
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar con Pasarela (SRI)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Feedback notification */}
            {shiftFeedback && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">{shiftFeedback}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Supply Explosion Engine Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif font-bold text-slate-900 text-sm">
                    Explosión Automática de Insumos (BoM)
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {shiftPax} PAX
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Cálculo instantáneo por persona de carnes, víveres, gaseosas, descartables y menaje protocolar necesario para despachar el turno:
              </p>

              {/* Explosion List */}
              <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
                {shiftExplosion.map((item) => (
                  <div key={item.sku} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{item.itemName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.sku} · {item.isConsumable ? 'Consumible' : 'Retornable'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-slate-900 text-sm block">
                        {item.totalQuantity} {item.unit}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({(item.totalQuantity / shiftPax).toFixed(2)}/PAX)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Al presionar <strong>"Registrar Turno"</strong>, estas cantidades se descuentan automáticamente de la bodega central en el Economato.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: EVENTOS & BANQUETES INSTITUCIONALES           */}
      {/* ======================================================== */}
      {activeTab === 'banquets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Event Configuration */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hall Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                1. Seleccione el Salón de Gala o Pérgola ({currentTenant.name}):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tenantHalls.map((hall) => {
                  const isSelected = selectedHallId === hall.id;
                  return (
                    <div
                      key={hall.id}
                      onClick={() => setSelectedHallId(hall.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 shadow-md ring-2 ring-indigo-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-serif font-bold text-slate-900">{hall.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                            Cap. {hall.capacity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {hall.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-bold text-indigo-700">
                          ${hall.baseRentalMember} Tarifa Socio
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {hall.location.split('-')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Setup Selector */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                2. Distribución y Montaje del Salón (Room Setup):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'banquete_mesas' as RoomSetup, label: 'Banquete Redondo (8-10u)' },
                  { id: 'imperial_u' as RoomSetup, label: 'Mesa Imperial en U' },
                  { id: 'auditorio' as RoomSetup, label: 'Auditorio Filas' },
                  { id: 'coctel_lounge' as RoomSetup, label: 'Cóctel & Periqueras' },
                ].map((setup) => (
                  <button
                    key={setup.id}
                    onClick={() => setRoomSetup(setup.id)}
                    className={`p-2.5 rounded-xl text-center text-xs font-semibold border transition-all ${
                      roomSetup === setup.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {setup.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Type & Menu Selection */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                3. Menú Especial de Banquete Castrense:
              </label>

              <div className="space-y-3">
                {MENU_OPTIONS_DATA.map((menu) => {
                  const isSelected = selectedMenuId === menu.id;
                  return (
                    <div
                      key={menu.id}
                      onClick={() => {
                        setSelectedMenuId(menu.id);
                        if (menu.category === 'banquete_gala') setBanquetEventType('banquete_gala');
                        if (menu.category === 'campestre') setBanquetEventType('almuerzo_campestre');
                        if (menu.category === 'coctel') setBanquetEventType('coctel_honor');
                        if (menu.category === 'desayuno') setBanquetEventType('desayuno_trabajo');
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-serif font-bold text-slate-900 text-sm">
                          {menu.name}
                        </span>
                        <span className="font-mono font-black text-indigo-800">
                          ${menu.memberPricePerPax.toFixed(2)} / PAX
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{menu.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
                        {menu.starter && (
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            Entrada: {menu.starter}
                          </span>
                        )}
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          Fuerte: {menu.mainCourse}
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-emerald-700">
                          Bebidas: {menu.drinksIncluded}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Date & PAX Slider for Banquet */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Fecha Programada del Evento:
                  </label>
                  <input
                    type="date"
                    value={banquetDate}
                    onChange={(e) => setBanquetDate(e.target.value)}
                    className="w-full sm:w-60 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Comensales Invitados (PAX):</span>
                  <span className="font-serif font-black text-lg text-indigo-700">
                    {banquetPax} Personas
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="350"
                  step="10"
                  value={banquetPax}
                  onChange={(e) => setBanquetPax(parseInt(e.target.value) || 10)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Additional Services Checklist */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                4. Servicios Adicionales de Mayordomía & Protocolo:
              </label>

              <div className="space-y-2">
                {services.map((srv) => (
                  <div
                    key={srv.serviceId}
                    onClick={() => toggleService(srv.serviceId)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      srv.selected
                        ? 'border-indigo-400 bg-indigo-50/50 text-indigo-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={srv.selected}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span>{srv.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      +${srv.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Banquet Financials & Tableware Assignment */}
          <div className="lg:col-span-5 space-y-5">
            {/* Financial Breakdown */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs uppercase font-bold text-slate-400">
                  Presupuesto & Liquidación Oficial SRI
                </span>
                <span className="text-[11px] text-indigo-400 font-mono">15% IVA Ecuador</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Alquiler Salón ({selectedHall.name}):</span>
                  <span className="font-mono font-bold">${hallRentalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Catering ({banquetPax} PAX x ${selectedMenu.memberPricePerPax.toFixed(2)}):
                  </span>
                  <span className="font-mono font-bold">${cateringCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Servicios de Mayordomía y Protocolo:</span>
                  <span className="font-mono font-bold">${servicesCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <span>Subtotal Gravado:</span>
                  <span className="font-mono font-bold">${banquetSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA SRI (15% Legal):</span>
                  <span className="font-mono font-bold">${banquetVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white border-t border-slate-800 pt-2">
                  <span>Total Evento Institucional:</span>
                  <span className="font-serif font-black text-indigo-400">
                    ${banquetTotal.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleExecuteBanquet}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-all"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Registrar y Despachar Banquete</span>
                </button>

                <button
                  onClick={handleCheckoutBanquet}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pagar Banquete con Pasarela (SRI)</span>
                </button>
              </div>
            </div>

            {/* Banquet Supply & Tableware Assignment Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Insumos & Menaje Asignado al Salón
                </h3>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  {banquetPax} PAX
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
                {banquetExplosion.map((item) => (
                  <div key={item.sku} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">{item.itemName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.sku} · {item.isConsumable ? 'Consumible' : 'Menaje Retornable'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {item.totalQuantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Banquet Feedback */}
            {banquetFeedback && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">{banquetFeedback}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
