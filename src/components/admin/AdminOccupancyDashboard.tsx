import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useReservation } from '../../context/ReservationContext';
import {
  UtensilsCrossed,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Bed,
  MapPin,
  LayoutGrid,
  Map,
  X,
  ChefHat,
  Coffee,
  Wine,
  UserPlus,
  Building2,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

interface CityRestaurantLocation {
  city: string;
  name: string;
  address: string;
  zoneId: string;
}

interface TableFloorItem {
  id: string;
  number: number;
  shape: 'circle' | 'rect' | 'large_rect';
  capacity: number;
  zone: 'Principal' | 'Terraza' | 'Salón de Honor';
  status: 'available' | 'occupied' | 'reserved';
  city: string;
  reservedBy?: string;
  rank?: string;
  pax?: number;
  timeSlot?: string;
  notes?: string;
  consumptionTotal?: number;
  serverName?: string;
}

interface AdminOccupancyDashboardProps {
  defaultSection?: 'restaurant' | 'lodging';
}

export const AdminOccupancyDashboard: React.FC<AdminOccupancyDashboardProps> = ({
  defaultSection = 'restaurant',
}) => {
  const { currentTenant, isCroe } = useTenant();
  const { facilities } = useReservation();

  const [activeSection, setActiveSection] = useState<'restaurant' | 'lodging'>(defaultSection);
  const [viewMode, setViewMode] = useState<'floorplan' | 'cards'>('floorplan');
  const [selectedShift, setSelectedShift] = useState<'desayuno' | 'almuerzo' | 'cena'>('almuerzo');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-14');
  const [selectedZone, setSelectedZone] = useState<'all' | 'Principal' | 'Terraza' | 'Salón de Honor'>('all');

  useEffect(() => {
    if (defaultSection) {
      setActiveSection(defaultSection);
    }
  }, [defaultSection]);

  // Multi-City Branches for CROE and Círculo Militar
  const branchLocations: CityRestaurantLocation[] = isCroe
    ? [
        { city: 'Quito - Cumbayá', name: 'Sede Campestre Los Pinos', address: 'Av. Interoceánica Km 12 1/2', zoneId: 'cumbaya' },
        { city: 'Sangolquí - Los Chillos', name: 'Club de Oficiales Valle de los Chillos', address: 'Autopista Gral. Rumiñahui', zoneId: 'chillos' },
        { city: 'Salinas', name: 'Hostería Militar Punta Carnero', address: 'Av. Malecón de Salinas', zoneId: 'salinas' },
      ]
    : [
        { city: 'Quito - Sede Central', name: 'Comedor Central Av. Orellana', address: 'Av. Orellana E4-44 y 12 de Octubre', zoneId: 'orellana' },
        { city: 'Sangolquí - La Armenia', name: 'Complejo Campestre La Armenia', address: 'Sector Club del Valle', zoneId: 'armenia' },
        { city: 'Guayaquil', name: 'Círculo Militar Guayas', address: 'Av. de las Américas y Plaza Dañín', zoneId: 'guayaquil' },
      ];

  const [selectedBranch, setSelectedBranch] = useState<string>(branchLocations[0].city);

  // Modal states
  const [activeTableModal, setActiveTableModal] = useState<TableFloorItem | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [tableToAssign, setTableToAssign] = useState<TableFloorItem | null>(null);

  // Form state for Admin assigning restaurant table
  const [assignForm, setAssignForm] = useState({
    officerName: '',
    rank: 'Coronel de E.M.',
    cedula: '',
    militaryCode: '',
    pax: 4,
    timeSlot: '13:00 - 15:00',
    notes: 'Reserva asignada desde Dirección Administrativa'
  });

  // Lodging Booking assignment modal & state
  const [isLodgingModalOpen, setIsLodgingModalOpen] = useState(false);
  const [lodgingFeedback, setLodgingFeedback] = useState<string | null>(null);
  const [lodgingAssignForm, setLodgingAssignForm] = useState({
    facilityId: '',
    officerName: '',
    rank: 'Coronel de E.M.',
    cedula: '1714859621',
    militaryCode: 'MIL-EC-2026',
    checkIn: '2026-11-14',
    checkOut: '2026-11-16',
    guests: 4,
    notes: 'Alojamiento oficial asignado por Dirección'
  });

  // Seeded lodging reservations for realistic demonstration of November calendar
  const [lodgingBookingsList, setLodgingBookingsList] = useState([
    {
      id: 'LODGE-001',
      facilityId: isCroe ? 'croe-cabana-andina' : 'circulo-suite-orellana',
      facilityName: isCroe ? 'Cabaña Familiar Andina' : 'Suite Ejecutiva de Oficiales',
      socioName: 'CRNL. DE E.M. CARLOS ALBERTO MENDOZA',
      rank: 'Coronel de E.M.',
      checkIn: '2026-11-13',
      checkOut: '2026-11-15',
      guests: 4,
      status: 'confirmed',
      notes: 'Retiro familiar de fin de semana'
    },
    {
      id: 'LODGE-002',
      facilityId: isCroe ? 'croe-suite-ejecutiva' : 'circulo-hab-confort',
      facilityName: isCroe ? 'Suite Ejecutiva de Oficiales' : 'Habitación Confort Doble',
      socioName: 'MAY. PATRICIO RENATO FALCONÍ',
      rank: 'Mayor de Caballería',
      checkIn: '2026-11-14',
      checkOut: '2026-11-17',
      guests: 2,
      status: 'confirmed',
      notes: 'Comisión oficial de inspección militar'
    },
    {
      id: 'LODGE-003',
      facilityId: isCroe ? 'croe-cabana-andina' : 'circulo-suite-orellana',
      facilityName: isCroe ? 'Cabaña Familiar Andina' : 'Suite Ejecutiva de Oficiales',
      socioName: 'GRAL. VÍCTOR MONCAYO',
      rank: 'General de Brigada',
      checkIn: '2026-11-20',
      checkOut: '2026-11-23',
      guests: 6,
      status: 'confirmed',
      notes: 'Jornada de Estado Mayor Conjunto'
    },
    {
      id: 'LODGE-004',
      facilityId: isCroe ? 'croe-habitacion-confort' : 'circulo-hab-confort',
      facilityName: isCroe ? 'Habitación Confort Doble' : 'Habitación Confort Doble',
      socioName: 'TCNL. ROBERTO SALAZAR',
      rank: 'Teniente Coronel',
      checkIn: '2026-11-20',
      checkOut: '2026-11-23',
      guests: 4,
      status: 'confirmed',
      notes: 'Comisión Logística de Abastecimiento'
    },
    {
      id: 'LODGE-005',
      facilityId: isCroe ? 'croe-suite-ejecutiva' : 'circulo-suite-orellana',
      facilityName: isCroe ? 'Suite Ejecutiva de Oficiales' : 'Suite Ejecutiva de Oficiales',
      socioName: 'CAP. DANIELA RIVERA',
      rank: 'Capitán de Sanidad',
      checkIn: '2026-11-20',
      checkOut: '2026-11-22',
      guests: 2,
      status: 'confirmed',
      notes: 'Coordinación Hospital Militar'
    },
    {
      id: 'LODGE-006',
      facilityId: isCroe ? 'croe-cabana-andina' : 'circulo-suite-orellana',
      facilityName: isCroe ? 'Cabaña Familiar Andina' : 'Suite Ejecutiva de Oficiales',
      socioName: 'CRNL. RODRIGO HERRERA',
      rank: 'Coronel de E.M.',
      checkIn: '2026-11-27',
      checkOut: '2026-11-29',
      guests: 5,
      status: 'confirmed',
      notes: 'Hospedaje de descanso protocolario'
    }
  ]);

  // Tables Data state (persists assignments made by admin)
  const [tablesList, setTablesList] = useState<TableFloorItem[]>([
    {
      id: 'T-01',
      number: 1,
      shape: 'rect',
      capacity: 4,
      zone: 'Principal',
      status: 'occupied',
      city: branchLocations[0].city,
      reservedBy: 'CRNL. Carlos Mendoza',
      rank: 'Coronel E.M.',
      pax: 4,
      timeSlot: '13:00 - 14:30',
      notes: 'Almuerzo familiar. Menú Ejecutivo',
      consumptionTotal: 48.50,
      serverName: 'Sargento Primero Gómez'
    },
    {
      id: 'T-02',
      number: 2,
      shape: 'rect',
      capacity: 4,
      zone: 'Principal',
      status: 'reserved',
      city: branchLocations[0].city,
      reservedBy: 'MAY. Patricio Falconí',
      rank: 'Mayor Caballería',
      pax: 3,
      timeSlot: '13:30 - 15:00',
      notes: 'Mesa de trabajo oficial. Esperando comensales',
      serverName: 'Cabo Segundo Quishpe'
    },
    {
      id: 'T-03',
      number: 3,
      shape: 'circle',
      capacity: 2,
      zone: 'Principal',
      status: 'available',
      city: branchLocations[0].city
    },
    {
      id: 'T-04',
      number: 4,
      shape: 'circle',
      capacity: 6,
      zone: 'Salón de Honor',
      status: 'occupied',
      city: branchLocations[0].city,
      reservedBy: 'GRAL. Víctor Moncayo',
      rank: 'General de Brigada',
      pax: 6,
      timeSlot: '12:30 - 14:30',
      notes: 'Mesa Protocolaria. Almuerzo de Estado Mayor',
      consumptionTotal: 125.00,
      serverName: 'Suboficial Mayor Lara'
    },
    {
      id: 'T-05',
      number: 5,
      shape: 'rect',
      capacity: 4,
      zone: 'Principal',
      status: 'available',
      city: branchLocations[0].city
    },
    {
      id: 'T-06',
      number: 6,
      shape: 'rect',
      capacity: 4,
      zone: 'Principal',
      status: 'available',
      city: branchLocations[0].city
    },
    {
      id: 'T-07',
      number: 7,
      shape: 'large_rect',
      capacity: 8,
      zone: 'Salón de Honor',
      status: 'reserved',
      city: branchLocations[0].city,
      reservedBy: 'TCNL. Roberto Salazar',
      rank: 'Teniente Coronel',
      pax: 7,
      timeSlot: '14:00 - 15:30',
      notes: 'Comisión Técnica de Adquisiciones',
      serverName: 'Sargento Primero Gómez'
    },
    {
      id: 'T-08',
      number: 8,
      shape: 'rect',
      capacity: 4,
      zone: 'Terraza',
      status: 'available',
      city: branchLocations[0].city
    },
    {
      id: 'T-09',
      number: 9,
      shape: 'circle',
      capacity: 2,
      zone: 'Terraza',
      status: 'occupied',
      city: branchLocations[0].city,
      reservedBy: 'CAP. Daniela Rivera',
      rank: 'Capitán de Sanidad',
      pax: 2,
      timeSlot: '13:15 - 14:15',
      consumptionTotal: 24.00,
      serverName: 'Cabo Segundo Quishpe'
    },
    {
      id: 'T-10',
      number: 10,
      shape: 'circle',
      capacity: 6,
      zone: 'Terraza',
      status: 'available',
      city: branchLocations[0].city
    },
    {
      id: 'T-11',
      number: 11,
      shape: 'rect',
      capacity: 4,
      zone: 'Principal',
      status: 'available',
      city: branchLocations[0].city
    },
    {
      id: 'T-12',
      number: 12,
      shape: 'rect',
      capacity: 4,
      zone: 'Principal',
      status: 'available',
      city: branchLocations[0].city
    },
  ]);

  const filteredTables = tablesList.filter(t => {
    const matchesZone = selectedZone === 'all' || t.zone === selectedZone;
    return matchesZone;
  });

  // Lodging facilities for the current tenant
  const lodgingFacilities = facilities.filter(f => f.category === 'lodging');

  // Stats
  const totalTables = tablesList.length;
  const occupiedTables = tablesList.filter(t => t.status === 'occupied').length;
  const reservedTables = tablesList.filter(t => t.status === 'reserved').length;
  const availableTables = tablesList.filter(t => t.status === 'available').length;
  const occupancyPercentage = Math.round(((occupiedTables + reservedTables) / totalTables) * 100);

  // Handle Admin Assigning a Table to an Officer
  const handleOpenAssignModal = (table: TableFloorItem) => {
    setTableToAssign(table);
    setAssignForm({
      officerName: '',
      rank: 'Coronel de E.M.',
      cedula: '1714859621',
      militaryCode: 'MIL-EC-2026',
      pax: table.capacity,
      timeSlot: selectedShift === 'desayuno' ? '08:00 - 09:30' : selectedShift === 'almuerzo' ? '13:00 - 14:30' : '19:30 - 21:00',
      notes: 'Asignado por Dirección Administrativa'
    });
    setIsAssignModalOpen(true);
  };

  const handleConfirmTableAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableToAssign || !assignForm.officerName) return;

    setTablesList(prev => prev.map(t => {
      if (t.id === tableToAssign.id) {
        return {
          ...t,
          status: 'reserved',
          reservedBy: `${assignForm.rank} ${assignForm.officerName}`,
          rank: assignForm.rank,
          pax: assignForm.pax,
          timeSlot: assignForm.timeSlot,
          notes: assignForm.notes,
          serverName: 'Servicio de Mesa Asignado'
        };
      }
      return t;
    }));

    setIsAssignModalOpen(false);
    setTableToAssign(null);
  };

  // Handle Table state transitions:
  const handleSeatTable = (tableId: string) => {
    setTablesList(prev => prev.map(t => t.id === tableId ? {
      ...t,
      status: 'occupied',
      consumptionTotal: 42.50,
      serverName: 'Sargento Primero Gómez'
    } : t));
    setActiveTableModal(null);
  };

  const handleFreeTable = (tableId: string) => {
    setTablesList(prev => prev.map(t => t.id === tableId ? {
      ...t,
      status: 'available',
      reservedBy: undefined,
      rank: undefined,
      pax: undefined,
      timeSlot: undefined,
      notes: undefined,
      consumptionTotal: undefined,
      serverName: undefined
    } : t));
    setActiveTableModal(null);
  };

  // Handle Lodging Assignment:
  const handleConfirmLodgingAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lodgingAssignForm.officerName) return;

    const targetFacility = lodgingFacilities.find(f => f.id === lodgingAssignForm.facilityId) || lodgingFacilities[0];

    const newBooking = {
      id: `LODGE-${Date.now().toString().slice(-4)}`,
      facilityId: targetFacility?.id || (isCroe ? 'croe-cabana-andina' : 'circulo-suite-orellana'),
      facilityName: targetFacility?.name || 'Alojamiento Oficial',
      socioName: `${lodgingAssignForm.rank.toUpperCase()} ${lodgingAssignForm.officerName.toUpperCase()}`,
      rank: lodgingAssignForm.rank,
      checkIn: lodgingAssignForm.checkIn,
      checkOut: lodgingAssignForm.checkOut,
      guests: lodgingAssignForm.guests,
      status: 'confirmed',
      notes: lodgingAssignForm.notes
    };

    setLodgingBookingsList(prev => [newBooking, ...prev]);
    setIsLodgingModalOpen(false);
    setLodgingFeedback(`¡Alojamiento asignado con éxito a ${lodgingAssignForm.rank} ${lodgingAssignForm.officerName} en ${newBooking.facilityName}!`);
    setTimeout(() => setLodgingFeedback(null), 4000);
  };

  // Helper to render chairs around table
  const renderChairs = (capacity: number, shape: 'circle' | 'rect' | 'large_rect', status: string) => {
    const chairBg = status === 'occupied'
      ? 'bg-rose-400 border-rose-600'
      : status === 'reserved'
      ? 'bg-amber-300 border-amber-500'
      : 'bg-emerald-300 border-emerald-500';

    if (shape === 'circle') {
      const chairs = [];
      for (let i = 0; i < capacity; i++) {
        const angle = (i * (360 / capacity)) * (Math.PI / 180);
        const radius = 48;
        const x = Math.round(50 + radius * Math.cos(angle));
        const y = Math.round(50 + radius * Math.sin(angle));
        chairs.push(
          <div
            key={i}
            className={`absolute w-4 h-4 rounded-full border shadow-xs transform -translate-x-1/2 -translate-y-1/2 ${chairBg}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        );
      }
      return <div className="absolute inset-0 pointer-events-none">{chairs}</div>;
    }

    if (shape === 'rect') {
      return (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute -top-2 left-6 w-5 h-3 rounded-t border ${chairBg}`} />
          <div className={`absolute -top-2 right-6 w-5 h-3 rounded-t border ${chairBg}`} />
          <div className={`absolute -bottom-2 left-6 w-5 h-3 rounded-b border ${chairBg}`} />
          <div className={`absolute -bottom-2 right-6 w-5 h-3 rounded-b border ${chairBg}`} />
        </div>
      );
    }

    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-2 left-6 w-5 h-3 rounded-t border ${chairBg}`} />
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-3 rounded-t border ${chairBg}`} />
        <div className={`absolute -top-2 right-6 w-5 h-3 rounded-t border ${chairBg}`} />
        <div className={`absolute -bottom-2 left-6 w-5 h-3 rounded-b border ${chairBg}`} />
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-3 rounded-b border ${chairBg}`} />
        <div className={`absolute -bottom-2 right-6 w-5 h-3 rounded-b border ${chairBg}`} />
        <div className={`absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-5 rounded-l border ${chairBg}`} />
        <div className={`absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-5 rounded-r border ${chairBg}`} />
      </div>
    );
  };

  // Days in month calculation for the lodging calendar
  const daysInMonth = 30; // November
  const totalPlazasCapacidad = lodgingFacilities.reduce((sum, f) => sum + f.capacity, 0) || 16;

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-11-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    
    // Check occupancy for this date across lodging facilities
    const dayBookings = lodgingBookingsList.filter(r => {
      return dateStr >= r.checkIn && dateStr <= r.checkOut;
    });

    const bookedPlazas = dayBookings.reduce((sum, b) => sum + b.guests, 0);
    const occupancyPercentage = Math.min(100, Math.round((bookedPlazas / totalPlazasCapacidad) * 100));
    const isPeak = occupancyPercentage >= 80;
    const isSelected = selectedDate === dateStr;

    return {
      dateStr,
      dayNum,
      bookingsCount: dayBookings.length,
      bookedPlazas,
      totalPlazas: totalPlazasCapacidad,
      occupancyPercentage,
      isPeak,
      isSelected,
      dayBookings
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-amber-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consola Exclusiva de Dirección & Administración</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 leading-tight">
              Control de Ocupación, Sucursales & Asignación de Plazas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Software para asignar mesas a oficiales, gestionar restaurantes en varias ciudades y monitorear el calendario de hospedaje.
            </p>
          </div>

          {/* Section Selector: Restaurant vs Lodging */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveSection('restaurant')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSection === 'restaurant'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
              <span>Mesas & Restaurantes</span>
            </button>
            <button
              onClick={() => setActiveSection('lodging')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSection === 'lodging'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Calendario & Hospedaje</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: RESTAURANT POS WITH MULTI-CITY LOCATIONS */}
      {/* ======================================================== */}
      {activeSection === 'restaurant' && (
        <div className="space-y-6">
          {/* Multi-City Branch Location Selector Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Red Nacional de Restaurantes & Sedes Militares
                </span>
                <h3 className="font-serif font-bold text-base text-white">
                  {selectedBranch} — {currentTenant.name}
                </h3>
              </div>
            </div>

            {/* City Selection Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {branchLocations.map((branch) => (
                <button
                  key={branch.city}
                  onClick={() => setSelectedBranch(branch.city)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedBranch === branch.city
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{branch.city}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls Bar: Date, Shift, Zone & View Mode */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Shift Selector */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setSelectedShift('desayuno')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    selectedShift === 'desayuno' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Desayuno</span>
                </button>
                <button
                  onClick={() => setSelectedShift('almuerzo')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    selectedShift === 'almuerzo' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Almuerzo</span>
                </button>
                <button
                  onClick={() => setSelectedShift('cena')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    selectedShift === 'cena' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Wine className="w-3.5 h-3.5" />
                  <span>Cena</span>
                </button>
              </div>

              {/* Zone Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase mr-1">Zona:</span>
                {(['all', 'Principal', 'Terraza', 'Salón de Honor'] as const).map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setSelectedZone(zone)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      selectedZone === zone
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {zone === 'all' ? 'Todas' : zone}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle: Visual Floor Plan vs Cards Grid */}
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <button
                  onClick={() => setViewMode('floorplan')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'floorplan'
                      ? 'bg-white text-slate-950 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5 text-orange-500" />
                  <span>Plano Visual POS</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-950 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
                  <span>Vista Fichas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Mesas Sede</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalTables} Mesas</p>
              <p className="text-[11px] text-slate-500">52 puestos en {selectedBranch.split(' - ')[0]}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Mesas Disponibles</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{availableTables} Libres</p>
              <p className="text-[11px] text-slate-500">Listas para reservar a oficiales</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Mesas Reservadas</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{reservedTables} Asignadas</p>
              <p className="text-[11px] text-slate-500">Por llegar en el turno</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Ocupadas en Sala</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{occupiedTables} En Consumo</p>
              <p className="text-[11px] text-slate-500">Ocupación del salón: {occupancyPercentage}%</p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* VIEW MODE 1: VISUAL RESTAURANT POS FLOOR PLAN */}
          {/* ======================================================== */}
          {viewMode === 'floorplan' && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
              {/* Floor Plan Header & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-serif font-black text-lg text-white flex items-center gap-2">
                    <Map className="w-5 h-5 text-amber-400" />
                    <span>Plano Arquitectónico POS: {selectedBranch}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Haga clic en una mesa <strong className="text-emerald-400">Libre</strong> para asignar y registrar una reserva a nombre de cualquier oficial o comitiva.
                  </p>
                </div>

                {/* Status Legend */}
                <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                    Libre ({availableTables})
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-xs" />
                    Reservada ({reservedTables})
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
                    En Sala ({occupiedTables})
                  </span>
                </div>
              </div>

              {/* Realistic Floor Plan Arena */}
              <div className="p-4 sm:p-8 bg-slate-950/70 rounded-2xl border border-slate-800/80 min-h-[500px] relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />

                <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800/60 pb-3 mb-8">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    ZONA PRINCIPAL (Mesas 1-6, 11-12)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    SALÓN PROTOCOLAR DE HONOR (Mesas 4, 7)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    TERRAZA & PÉRGOLA (Mesas 8-10)
                  </span>
                </div>

                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-12 justify-items-center py-4">
                  {filteredTables.map((table) => {
                    const isOccupied = table.status === 'occupied';
                    const isReserved = table.status === 'reserved';
                    const isAvail = table.status === 'available';

                    const tableBorderColor = isOccupied
                      ? 'border-rose-500 bg-rose-950/60 shadow-rose-900/40 text-rose-100'
                      : isReserved
                      ? 'border-amber-400 bg-amber-950/60 shadow-amber-900/40 text-amber-100'
                      : 'border-emerald-500 bg-emerald-950/60 shadow-emerald-900/30 text-emerald-100 hover:border-emerald-300';

                    return (
                      <div
                        key={table.id}
                        onClick={() => {
                          if (isAvail) {
                            handleOpenAssignModal(table);
                          } else {
                            setActiveTableModal(table);
                          }
                        }}
                        className="group relative cursor-pointer flex flex-col items-center transition-all duration-300 transform hover:scale-105"
                      >
                        <div
                          className={`relative flex flex-col items-center justify-center p-3 border-2 shadow-xl backdrop-blur-md transition-all ${tableBorderColor} ${
                            table.shape === 'circle'
                              ? 'w-24 h-24 rounded-full'
                              : table.shape === 'large_rect'
                              ? 'w-36 h-22 rounded-2xl'
                              : 'w-28 h-22 rounded-2xl'
                          }`}
                        >
                          {renderChairs(table.capacity, table.shape, table.status)}

                          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                            MESA
                          </span>
                          <span className="text-xl font-black font-serif text-white drop-shadow-md">
                            {table.number}
                          </span>
                          <span className="text-[9px] font-semibold opacity-90">
                            {table.capacity} sillas
                          </span>

                          <span
                            className={`w-2 h-2 rounded-full mt-0.5 animate-pulse ${
                              isOccupied ? 'bg-rose-400' : isReserved ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                          />
                        </div>

                        {/* Officer or Action Label */}
                        <div className="mt-3 text-center max-w-[140px]">
                          {!isAvail ? (
                            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1 text-[11px] shadow-md group-hover:border-amber-400/60 transition-colors">
                              <p className="font-bold text-white truncate text-[11px]">
                                {table.reservedBy}
                              </p>
                              <p className="text-[9px] text-amber-300/90 font-mono">
                                🕒 {table.timeSlot}
                              </p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAssignModal(table);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-2.5 py-1 rounded-full shadow-sm transition-all"
                            >
                              <UserPlus className="w-3 h-3 text-slate-950" />
                              <span>Asignar Mesa</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW MODE 2: CLASSIC CARDS GRID VIEW */}
          {/* ======================================================== */}
          {viewMode === 'cards' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Fichas de Mesas — {selectedBranch}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspección tabular del comedor con estatus de servicio y comensales.
                  </p>
                </div>
                <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                  Turno: {selectedShift.toUpperCase()} · Fecha: {selectedDate}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTables.map((table) => {
                  const isOccupied = table.status === 'occupied';
                  const isReserved = table.status === 'reserved';
                  const isAvail = table.status === 'available';

                  return (
                    <div
                      key={table.id}
                      onClick={() => {
                        if (isAvail) handleOpenAssignModal(table);
                        else setActiveTableModal(table);
                      }}
                      className={`rounded-2xl p-4 border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                        isOccupied
                          ? 'bg-rose-50/70 border-rose-300 hover:shadow-md'
                          : isReserved
                          ? 'bg-amber-50/70 border-amber-300 hover:shadow-md'
                          : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-black text-base text-slate-900">
                          Mesa {table.number}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isOccupied
                              ? 'bg-rose-600 text-white'
                              : isReserved
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isOccupied ? 'Ocupada' : isReserved ? 'Reservada' : 'Disponible'}
                        </span>
                      </div>

                      <div className="mt-2 text-xs space-y-1">
                        <p className="text-slate-600 flex items-center justify-between">
                          <span>Zona:</span>
                          <strong className="text-slate-800">{table.zone}</strong>
                        </p>
                        <p className="text-slate-600 flex items-center justify-between">
                          <span>Capacidad:</span>
                          <strong className="text-slate-800">{table.capacity} personas</strong>
                        </p>
                      </div>

                      {!isAvail && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1 bg-white/70 p-2.5 rounded-xl text-xs">
                          <p className="font-bold text-slate-900 truncate">
                            {table.reservedBy}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{table.rank}</p>
                          <p className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{table.timeSlot} · {table.pax} comensales</span>
                          </p>
                        </div>
                      )}

                      {isAvail && (
                        <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-semibold">
                          <span className="flex items-center gap-1">
                            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                            Clic para Asignar
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: LODGING CALENDAR & PLAZAS DISPONIBLES */}
      {/* ======================================================== */}
      {activeSection === 'lodging' && (
        <div className="space-y-6">
          {/* Calendar Master Dashboard Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Calendario Maestro de Ocupación Hotelera
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-900 mt-1">
                  Noviembre 2026 — Plazas & Fechas de Hospedaje
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consulte día a día el número de reservas confirmadas, plazas ocupadas frente a la capacidad máxima del club.
                </p>
              </div>

              {/* Month Navigator Mock */}
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-slate-800 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
                  Noviembre 2026
                </span>
                <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monthly Calendar Heatmap Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span className="text-amber-600">Sáb</span>
                <span className="text-amber-600">Dom</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const hasBookings = day.bookingsCount > 0;
                  const isSelected = day.isSelected;
                  const isPeak = day.isPeak;

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`min-h-[96px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-600/30 bg-indigo-50/70 shadow-md'
                          : isPeak
                          ? 'border-rose-400 bg-rose-50/70 hover:border-rose-500 shadow-xs'
                          : hasBookings
                          ? 'border-amber-300 bg-amber-50/50 hover:border-amber-400 hover:shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-black ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {day.dayNum}
                        </span>
                        {hasBookings && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                              isPeak ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {isPeak ? 'Lleno' : `${day.bookingsCount} rsv`}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] space-y-1">
                        {hasBookings ? (
                          <>
                            <div className={`font-bold truncate text-[10px] ${isPeak ? 'text-rose-900' : 'text-amber-900'}`}>
                              {day.bookedPlazas} de {day.totalPlazas} plazas ({day.occupancyPercentage}%)
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isPeak ? 'bg-rose-600' : 'bg-amber-500'
                                }`}
                                style={{ width: `${day.occupancyPercentage}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <div>
                            <span className="text-emerald-700 font-semibold block text-[10px]">
                              {day.totalPlazas} libres (0%)
                            </span>
                            <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden mt-0.5">
                              <div className="h-full bg-emerald-400 rounded-full w-0" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Breakdown Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[11px] block">FECHA SELECCIONADA PARA INSPECCIÓN</span>
                  <p className="font-bold text-sm text-white">{selectedDate}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <span>Capacidad Total: <strong>{totalPlazasCapacidad} Huéspedes</strong></span>
                <span>•</span>
                <span className="text-amber-300">
                  Ocupadas:{' '}
                  <strong>
                    {lodgingBookingsList
                      .filter(r => selectedDate >= r.checkIn && selectedDate <= r.checkOut)
                      .reduce((acc, curr) => acc + curr.guests, 0)}{' '}
                    Huéspedes (
                    {Math.min(
                      100,
                      Math.round(
                        (lodgingBookingsList
                          .filter(r => selectedDate >= r.checkIn && selectedDate <= r.checkOut)
                          .reduce((acc, curr) => acc + curr.guests, 0) /
                          totalPlazasCapacidad) *
                          100
                      )
                    )}
                    % Ocupación)
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setLodgingAssignForm(prev => ({
                      ...prev,
                      checkIn: selectedDate,
                      checkOut: selectedDate
                    }));
                    setIsLodgingModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow font-sans ml-auto sm:ml-0"
                >
                  <UserPlus className="w-4 h-4 text-slate-950" />
                  <span>Asignar Hospedaje en esta Fecha</span>
                </button>
              </div>
            </div>

            {lodgingFeedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-fadeIn font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lodgingFeedback}</span>
              </div>
            )}
          </div>

          {/* Lodging Facilities Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lodgingFacilities.map((facility) => {
              const matchingBookings = lodgingBookingsList.filter(
                r => r.facilityId === facility.id && selectedDate >= r.checkIn && selectedDate <= r.checkOut
              );
              const isOccupiedOnSelectedDate = matchingBookings.length > 0;

              return (
                <div
                  key={facility.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Facility Image with Status Overlay */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={facility.imageUrl}
                        alt={facility.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${
                          isOccupiedOnSelectedDate
                            ? 'bg-rose-600 text-white border border-rose-300'
                            : 'bg-emerald-600 text-white border border-emerald-300'
                        }`}
                      >
                        {isOccupiedOnSelectedDate ? 'Reservada en Fecha' : 'Disponible en Fecha'}
                      </span>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="font-serif font-black text-base text-white truncate drop-shadow-md">
                          {facility.name}
                        </h4>
                        <p className="text-xs text-amber-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{facility.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-slate-400" />
                          Capacidad Máxima: <strong>{facility.capacity} plazas</strong>
                        </span>
                        <span className="font-bold text-slate-900">
                          ${facility.memberPrice} / noche
                        </span>
                      </div>

                      {/* Active or Upcoming Bookings List */}
                      <div>
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Estatus para la Fecha {selectedDate}
                        </h5>

                        {matchingBookings.length > 0 ? (
                          <div className="space-y-2">
                            {matchingBookings.map((res) => (
                              <div
                                key={res.id}
                                className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-900">
                                  <span className="truncate max-w-[170px] text-rose-950">{res.socioName}</span>
                                  <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-mono">
                                    {res.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                                  <span>📅 {res.checkIn} al {res.checkOut}</span>
                                  <span>{res.guests} Huéspedes</span>
                                </div>
                                {res.notes && (
                                  <p className="text-[10px] text-slate-500 italic mt-1">"{res.notes}"</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>100% Disponible para asignar en esta fecha.</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setLodgingAssignForm(prev => ({
                                  ...prev,
                                  facilityId: facility.id,
                                  checkIn: selectedDate,
                                  checkOut: '2026-11-16'
                                }));
                                setIsLodgingModalOpen(true);
                              }}
                              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-white" />
                              <span>Asignar {facility.name}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                      <span>Mantenimiento & Desinfección:</span>
                      <strong className="text-emerald-700">Aprobado / Al Día</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADMIN ASSIGN TABLE TO AN OFFICER */}
      {/* ======================================================== */}
      {isAssignModalOpen && tableToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm">
                  Mesa #{tableToAssign.number}
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-slate-900">
                    Asignar Reserva desde Administración
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sede: {selectedBranch} · Zona: {tableToAssign.zone} ({tableToAssign.capacity} personas)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTableAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo del Oficial Titular *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: PATRICIO RENATO FALCONÍ CORONEL"
                  value={assignForm.officerName}
                  onChange={(e) => setAssignForm({ ...assignForm, officerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Grado Militar
                  </label>
                  <select
                    value={assignForm.rank}
                    onChange={(e) => setAssignForm({ ...assignForm, rank: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="General de Brigada">General de Brigada</option>
                    <option value="Coronel de E.M.">Coronel de E.M.</option>
                    <option value="Teniente Coronel">Teniente Coronel</option>
                    <option value="Mayor de Caballería">Mayor de Caballería</option>
                    <option value="Capitán">Capitán</option>
                    <option value="Teniente">Teniente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Comensales (PAX)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={tableToAssign.capacity}
                    value={assignForm.pax}
                    onChange={(e) => setAssignForm({ ...assignForm, pax: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Horario de Llegada
                  </label>
                  <input
                    type="text"
                    value={assignForm.timeSlot}
                    onChange={(e) => setAssignForm({ ...assignForm, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cédula / Cód. Militar
                  </label>
                  <input
                    type="text"
                    value={assignForm.cedula}
                    onChange={(e) => setAssignForm({ ...assignForm, cedula: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notas de Protocolo / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Confirmar Asignación de Mesa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TABLE INSPECTION MODAL */}
      {/* ======================================================== */}
      {activeTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-white font-bold text-sm ${
                  activeTableModal.status === 'occupied'
                    ? 'bg-rose-600'
                    : activeTableModal.status === 'reserved'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-600'
                }`}>
                  Mesa #{activeTableModal.number}
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-slate-900">
                    Detalle Operativo de Mesa
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sede: {activeTableModal.city} · Zona: {activeTableModal.zone} ({activeTableModal.capacity} personas)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTableModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTableModal.status !== 'available' ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Oficial a Cargo de la Mesa
                  </span>
                  <p className="font-bold text-slate-900 text-base">{activeTableModal.reservedBy}</p>
                  <p className="text-xs text-slate-600">{activeTableModal.rank}</p>
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-700 font-mono">
                    <span>Horario: {activeTableModal.timeSlot}</span>
                    <span>Comensales: {activeTableModal.pax} PAX</span>
                  </div>
                </div>

                {activeTableModal.serverName && (
                  <div className="flex items-center justify-between text-xs p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-900">
                    <span>Camarero / Mesonero asignado:</span>
                    <strong>{activeTableModal.serverName}</strong>
                  </div>
                )}

                {activeTableModal.consumptionTotal && (
                  <div className="flex items-center justify-between text-sm p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                    <span>Consumo en Curso (Pre-cuenta):</span>
                    <span className="text-base text-emerald-700 font-mono">
                      ${activeTableModal.consumptionTotal.toFixed(2)} USD
                    </span>
                  </div>
                )}

                {activeTableModal.notes && (
                  <p className="text-xs text-slate-600 bg-slate-100 p-3 rounded-xl italic">
                    Notas: "{activeTableModal.notes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-900 text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base">Mesa Totalmente Disponible</h4>
                <p className="text-xs text-emerald-700">
                  Esta mesa cuenta con sus {activeTableModal.capacity} puestos con vajilla montada y lista para recibir comensales en el turno actual.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              {activeTableModal.status === 'available' && (
                <button
                  type="button"
                  onClick={() => {
                    const tbl = activeTableModal;
                    setActiveTableModal(null);
                    handleOpenAssignModal(tbl);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Asignar a un Oficial</span>
                </button>
              )}

              {activeTableModal.status === 'reserved' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSeatTable(activeTableModal.id)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Sentar Comensales</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFreeTable(activeTableModal.id)}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors"
                  >
                    Cancelar Reserva
                  </button>
                </div>
              )}

              {activeTableModal.status === 'occupied' && (
                <button
                  type="button"
                  onClick={() => handleFreeTable(activeTableModal.id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Liberar Mesa (Cuenta Liquidada)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTableModal(null)}
                className="ml-auto px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADMIN ASSIGN LODGING ROOM / CABIN */}
      {/* ======================================================== */}
      {isLodgingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-slate-900">
                    Asignar Hospedaje a Oficial
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reserva oficial castrense desde Dirección Administrativa
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLodgingModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmLodgingAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instalación / Cabaña / Suite *
                </label>
                <select
                  value={lodgingAssignForm.facilityId || lodgingFacilities[0]?.id}
                  onChange={(e) => setLodgingAssignForm({ ...lodgingAssignForm, facilityId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {lodgingFacilities.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} (Capacidad: {f.capacity} plazas — ${f.memberPrice}/noche)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo del Oficial Titular *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: PATRICIO RENATO FALCONÍ CORONEL"
                  value={lodgingAssignForm.officerName}
                  onChange={(e) => setLodgingAssignForm({ ...lodgingAssignForm, officerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Grado Militar
                  </label>
                  <select
                    value={lodgingAssignForm.rank}
                    onChange={(e) => setLodgingAssignForm({ ...lodgingAssignForm, rank: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="General de Brigada">General de Brigada</option>
                    <option value="Coronel de E.M.">Coronel de E.M.</option>
                    <option value="Teniente Coronel">Teniente Coronel</option>
                    <option value="Mayor de Caballería">Mayor de Caballería</option>
                    <option value="Capitán">Capitán</option>
                    <option value="Teniente">Teniente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Número de Huéspedes
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={lodgingAssignForm.guests}
                    onChange={(e) => setLodgingAssignForm({ ...lodgingAssignForm, guests: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Entrada (Check-In)
                  </label>
                  <input
                    type="date"
                    value={lodgingAssignForm.checkIn}
                    onChange={(e) => setLodgingAssignForm({ ...lodgingAssignForm, checkIn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Salida (Check-Out)
                  </label>
                  <input
                    type="date"
                    value={lodgingAssignForm.checkOut}
                    onChange={(e) => setLodgingAssignForm({ ...lodgingAssignForm, checkOut: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notas de Misión / Protocolo
                </label>
                <textarea
                  rows={2}
                  value={lodgingAssignForm.notes}
                  onChange={(e) => setLodgingAssignForm({ ...lodgingAssignForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLodgingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Confirmar Asignación de Hospedaje</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
