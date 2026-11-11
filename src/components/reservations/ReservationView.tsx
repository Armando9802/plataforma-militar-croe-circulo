import React, { useState, useMemo } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useReservation } from '../../context/ReservationContext';
import { FacilityCategory, Reservation } from '../../types/reservation';
import { FacilityCard } from './FacilityCard';
import { AvailabilityModal } from './AvailabilityModal';
import { BookingSummaryModal } from './BookingSummaryModal';
import { MyBookingsDrawer } from './MyBookingsDrawer';
import {
  CalendarCheck,
  CreditCard,
  Search,
  Filter,
  Users,
  Home,
  Trophy,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface ReservationViewProps {
  onNavigateToPayment?: (reservation?: Reservation) => void;
}

export const ReservationView: React.FC<ReservationViewProps> = ({
  onNavigateToPayment,
}) => {
  const { currentTenant } = useTenant();
  const {
    facilities,
    reservations,
    selectedFacility,
    draftBooking,
    isAvailabilityModalOpen,
    isSummaryModalOpen,
    isMyBookingsOpen,
    openAvailabilityModal,
    closeAvailabilityModal,
    closeSummaryModal,
    openMyBookings,
    closeMyBookings,
  } = useReservation();

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState<'all' | FacilityCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');

  // Filtered facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((fac) => {
      // Category filter
      if (categoryFilter !== 'all' && fac.category !== categoryFilter) {
        return false;
      }

      // Search query filter (by name, description, subcategory, location, amenities)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = fac.name.toLowerCase().includes(q);
        const matchesDesc = fac.description.toLowerCase().includes(q);
        const matchesSubcat = fac.subcategory.toLowerCase().includes(q);
        const matchesLoc = fac.location.toLowerCase().includes(q);
        const matchesAmenity = fac.amenities.some((a) => a.toLowerCase().includes(q));

        if (!matchesName && !matchesDesc && !matchesSubcat && !matchesLoc && !matchesAmenity) {
          return false;
        }
      }

      // Capacity filter
      if (capacityFilter === '1-2' && fac.capacity > 2) return false;
      if (capacityFilter === '3-4' && (fac.capacity < 3 || fac.capacity > 4)) return false;
      if (capacityFilter === '5+' && fac.capacity < 5) return false;

      return true;
    });
  }, [facilities, categoryFilter, searchQuery, capacityFilter]);

  const lodgingCount = useMemo(
    () => facilities.filter((f) => f.category === 'lodging').length,
    [facilities]
  );
  const sportsCount = useMemo(
    () => facilities.filter((f) => f.category === 'sports').length,
    [facilities]
  );

  const resetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setCapacityFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 bg-amber-100 text-amber-800">
            <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Catálogo de Infraestructura & Canchas</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            Instalaciones Disponibles · {currentTenant.name}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Seleccione espacios de hospedaje campestre, suites protocolares o canchas deportivas para oficiales y sus familias.
          </p>
        </div>

        {/* Top Actions: My Bookings & Payment Gateway CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openMyBookings}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-300 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all"
            aria-label="Abrir mis reservas activas"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Mis Reservas Activas</span>
            {reservations.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                {reservations.length}
              </span>
            )}
          </button>

          {onNavigateToPayment && (
            <button
              type="button"
              onClick={() => onNavigateToPayment()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
              style={{ backgroundColor: currentTenant.theme.primaryColor }}
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span>Simular Pago de Reserva</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'all'
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              style={
                categoryFilter === 'all'
                  ? { backgroundColor: currentTenant.theme.primaryColor }
                  : {}
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Todas ({facilities.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter('lodging')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'lodging'
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              style={
                categoryFilter === 'lodging'
                  ? { backgroundColor: currentTenant.theme.primaryColor }
                  : {}
              }
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>🏨 Hospedaje y Cabañas ({lodgingCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter('sports')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'sports'
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              style={
                categoryFilter === 'sports'
                  ? { backgroundColor: currentTenant.theme.primaryColor }
                  : {}
              }
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>🎾 Deportes y Recreación ({sportsCount})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Mostrando {filteredFacilities.length} de {facilities.length} instalaciones
          </div>
        </div>

        {/* Inputs row: Search & Capacity */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre de instalación o amenidad (ej. Cabaña, Tenis, Chimenea)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Capacity Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Users className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas las capacidades</option>
              <option value="1-2">1 a 2 personas</option>
              <option value="3-4">3 a 4 personas</option>
              <option value="5+">5 o más personas</option>
            </select>
          </div>

          {/* Reset button if active filters */}
          {(categoryFilter !== 'all' || searchQuery !== '' || capacityFilter !== 'all') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Facilities Grid or Empty Filter Notice */}
      {filteredFacilities.length === 0 ? (
        /* Notice matching T2-EMP-03 */
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-slate-800 text-lg">
              No se encontraron instalaciones disponibles con los filtros seleccionados.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Intente ajustar los términos de búsqueda, la categoría o la capacidad requerida para ver el catálogo completo de {currentTenant.name}.
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: currentTenant.theme.primaryColor }}
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        /* Facilities Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onSelect={openAvailabilityModal}
            />
          ))}
        </div>
      )}

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={closeAvailabilityModal}
        facility={selectedFacility}
      />

      {/* Booking Summary Modal */}
      <BookingSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={closeSummaryModal}
        draft={draftBooking}
        onProceedToPayment={onNavigateToPayment}
      />

      {/* My Bookings Drawer */}
      <MyBookingsDrawer
        isOpen={isMyBookingsOpen}
        onClose={closeMyBookings}
        onProceedToPayment={onNavigateToPayment}
      />
    </div>
  );
};
