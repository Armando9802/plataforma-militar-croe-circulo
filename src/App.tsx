import React, { useState } from 'react';
import { TenantProvider, useTenant } from './context/TenantContext';
import { ReservationProvider } from './context/ReservationContext';
import { PaymentProvider, usePayment } from './context/PaymentContext';
import { InventoryProvider } from './context/InventoryContext';
import { TenantSwitchBar } from './components/common/TenantSwitchBar';
import { Navbar, ActiveTab, UserRole } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { InstitutionalHero } from './components/portal/InstitutionalHero';
import { SocioProfileView } from './components/socio/SocioProfileView';
import { GaritaScannerModal } from './components/socio/GaritaScannerModal';
import { ReservationView } from './components/reservations/ReservationView';
import { RestaurantView } from './components/restaurant/RestaurantView';
import { InventoryView } from './components/inventory/InventoryView';
import { PaymentView } from './components/payment/PaymentView';
import { PaymentCheckoutModal } from './components/payment/PaymentCheckoutModal';
import { DigitalReceiptModal } from './components/payment/DigitalReceiptModal';
import { AdminOccupancyDashboard } from './components/admin/AdminOccupancyDashboard';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>('socio');
  const [isGaritaModalOpen, setIsGaritaModalOpen] = useState(false);
  const { currentTenant } = useTenant();
  const {
    currentTransaction,
    isReceiptModalOpen,
    closeReceiptModal,
    initiatePayment,
  } = usePayment();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-300">
      {/* Top Multi-Tenant Institutional Switcher Bar */}
      <TenantSwitchBar />

      {/* Main Institutional Navigation Bar with Role Separation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenGarita={() => setIsGaritaModalOpen(true)}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <InstitutionalHero
            onNavigate={setActiveTab}
            onOpenGarita={() => setIsGaritaModalOpen(true)}
          />
        )}

        {/* Socio Module: Military Dossier, 3D Digital Carné, Verifiable QR & Garita Simulator */}
        {activeTab === 'socio' && (
          <SocioProfileView onOpenGarita={() => setIsGaritaModalOpen(true)} />
        )}

        {/* Reservations Module: Facility Catalog or Admin Occupancy Map */}
        {activeTab === 'reservations' && (
          currentRole === 'admin' ? (
            <AdminOccupancyDashboard defaultSection="lodging" />
          ) : (
            <ReservationView
              onNavigateToPayment={(reservation) => {
                if (reservation) {
                  initiatePayment({
                    reservationId: reservation.id,
                    socioId: reservation.socioId,
                    socioName: reservation.socioName,
                    amount: reservation.total,
                    description: `Liquidación Reserva ${reservation.facilityName} (${reservation.id})`,
                  });
                }
                setActiveTab('payment');
              }}
            />
          )
        )}

        {/* Restaurant & Banquet Shifts Module */}
        {activeTab === 'restaurant' && (
          currentRole === 'admin' ? (
            <AdminOccupancyDashboard defaultSection="restaurant" />
          ) : (
            <RestaurantView
              onNavigateToPayment={(booking) => {
                if (booking) {
                  initiatePayment({
                    reservationId: booking.id,
                    socioId: booking.socioId,
                    socioName: booking.socioName,
                    amount: booking.total,
                    description: `Servicio Restaurante & Eventos: ${booking.facilityName}`,
                  });
                }
                setActiveTab('payment');
              }}
            />
          )
        )}

        {/* Inventory & Economato Module: 4 Categories, BoM Explosion & Kardex */}
        {activeTab === 'inventory' && <InventoryView />}

        {/* Payment Module: Payphone, Kushki & SRI Electronic Voucher */}
        {activeTab === 'payment' && <PaymentView />}
      </main>

      {/* Global Garita Scanner Simulator Modal */}
      <GaritaScannerModal
        isOpen={isGaritaModalOpen}
        onClose={() => setIsGaritaModalOpen(false)}
        socio={currentTenant.defaultSocio}
        tenantId={currentTenant.id}
      />

      {/* Global Payment Checkout & SRI Digital Receipt Modals */}
      <PaymentCheckoutModal />
      <DigitalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={closeReceiptModal}
        transaction={currentTransaction}
      />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TenantProvider>
      <ReservationProvider>
        <PaymentProvider>
          <InventoryProvider>
            <AppContent />
          </InventoryProvider>
        </PaymentProvider>
      </ReservationProvider>
    </TenantProvider>
  );
};

export default App;
