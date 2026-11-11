import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useTenant } from '../../context/TenantContext';
import { KardexAuditView } from './KardexAuditView';
import { InvoiceUploadModal } from './InvoiceUploadModal';
import { TablewareAuditModal } from './TablewareAuditModal';
import {
  Boxes,
  Search,
  AlertOctagon,
  AlertTriangle,
  Receipt,
  RotateCcw,
  PackageCheck,
  TrendingDown,
  UtensilsCrossed,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    totalValuation,
    criticalItemsCount,
    warningItemsCount,
    tablewareInCirculationCount,
    adjustStockManual,
  } = useInventory();
  const { currentTenant } = useTenant();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'kardex' | 'invoices' | 'audit'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Manual Adjustment Inline Modal / Prompt
  const [adjustingItem, setAdjustingItem] = useState<string | null>(null);
  const [adjustedQty, setAdjustedQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

      const isAlert = item.currentStock <= item.reorderPoint;
      const matchesAlertFilter = !onlyAlerts || isAlert;

      return matchesSearch && matchesCat && matchesAlertFilter;
    });
  }, [inventory, searchTerm, selectedCategory, onlyAlerts]);

  const getStatusBadge = (current: number, min: number, reorder: number) => {
    if (current <= min) {
      return {
        label: 'CRÍTICO',
        color: 'bg-rose-100 text-rose-800 border-rose-300',
        barColor: 'bg-rose-500',
      };
    }
    if (current <= reorder) {
      return {
        label: 'PRECAUCIÓN',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        barColor: 'bg-amber-500',
      };
    }
    return {
      label: 'ÓPTIMO',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      barColor: 'bg-emerald-500',
    };
  };

  const handleOpenAdjust = (itemCode: string, currStock: number) => {
    setAdjustingItem(itemCode);
    setAdjustedQty(currStock);
    setAdjustReason('Ajuste físico de arqueo en economato');
  };

  const handleSaveAdjust = () => {
    if (!adjustingItem) return;
    adjustStockManual(adjustingItem, adjustedQty, adjustReason);
    setAdjustingItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl text-white shadow-md"
              style={{ backgroundColor: currentTenant.theme.primaryColor }}
            >
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl text-slate-900">
                Economato Central & Control de Existencias
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Almacén militar de víveres, menaje protocolar, bebidas y descarte — {currentTenant.name}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>Ingresar Factura SRI</span>
          </button>

          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Auditoría de Menaje Post-Evento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Valorización en Bodega
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif font-black text-2xl text-slate-900">
              ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              USD Activo
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">20 referencias valoradas a PMP</p>
        </div>

        {/* KPI 2: Critical Alerts */}
        <div
          onClick={() => {
            setActiveSubTab('catalog');
            setOnlyAlerts(true);
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-rose-300 transition-colors"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            Alertas Críticas (Mínimo)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif font-black text-2xl text-rose-700">
              {criticalItemsCount}
            </span>
            <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Reabastecer Ya
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Stock inferior al umbral mínimo</p>
        </div>

        {/* KPI 3: Reorder Point Warning */}
        <div
          onClick={() => {
            setActiveSubTab('catalog');
            setOnlyAlerts(true);
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-300 transition-colors"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Punto de Reorden (ROP)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif font-black text-2xl text-amber-700">
              {warningItemsCount}
            </span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Precaución
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Emitir orden de compra al proveedor</p>
        </div>

        {/* KPI 4: Tableware in Circulation */}
        <div
          onClick={() => setIsAuditModalOpen(true)}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block flex items-center gap-1">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Menaje en Circulación
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif font-black text-2xl text-indigo-800">
              {tablewareInCirculationCount}
            </span>
            <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              En Salones
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Vajilla y copas pendientes de retorno</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setActiveSubTab('catalog');
            setOnlyAlerts(false);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'catalog'
              ? 'text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          style={
            activeSubTab === 'catalog'
              ? { backgroundColor: currentTenant.theme.primaryColor }
              : {}
          }
        >
          <PackageCheck className="w-4 h-4" />
          <span>Catálogo de Existencias ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kardex')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'kardex'
              ? 'text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          style={
            activeSubTab === 'kardex'
              ? { backgroundColor: currentTenant.theme.primaryColor }
              : {}
          }
        >
          <TrendingDown className="w-4 h-4" />
          <span>Bitácora Kardex Perpetuo</span>
        </button>
      </div>

      {/* Sub-Tab 1: Catalog View */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-5">
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar artículo, código o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category pills */}
              {[
                { id: 'all', label: 'Todas las Categorías' },
                { id: 'disposables', label: 'Insumos / Descartables' },
                { id: 'tableware', label: 'Menaje / Cubiertos' },
                { id: 'beverages', label: 'Bebidas' },
                { id: 'kitchen_food', label: 'Alimentos Cocina' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              {/* Alert Toggle */}
              <button
                onClick={() => setOnlyAlerts(!onlyAlerts)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  onlyAlerts
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Solo Alertas ({criticalItemsCount + warningItemsCount})
              </button>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const status = getStatusBadge(item.currentStock, item.minStock, item.reorderPoint);
              const percentage = Math.min(100, Math.round((item.currentStock / item.optimalStock) * 100));

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header: Code & Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif font-bold text-slate-900 text-sm mt-2 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.location}</p>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800 text-sm">
                        {item.currentStock} {item.unit}s
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Cap. Óptima: {item.optimalStock}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${status.barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Mín: {item.minStock}</span>
                      <span>Reorden: {item.reorderPoint}</span>
                    </div>
                  </div>

                  {/* Returnable or Details info */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        Costo Unitario
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        ${item.unitCost.toFixed(2)} USD
                      </span>
                    </div>

                    {item.isReturnable && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                          En Circulación
                        </span>
                        <span className="font-bold text-indigo-700">
                          {item.inCirculationStock || 0} {item.unit}s
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenAdjust(item.code, item.currentStock)}
                      title="Ajuste manual de existencias físicas"
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Ajustar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">No se encontraron artículos en el catálogo</p>
              <p className="text-xs text-slate-400 mt-1">
                Intente ajustar los términos de búsqueda o cambiar de categoría.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Kardex Audit View */}
      {activeSubTab === 'kardex' && <KardexAuditView />}

      {/* Inline Adjustment Dialog */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 border border-slate-200 animate-fadeIn">
            <h3 className="font-serif font-bold text-slate-900 text-sm">
              Ajuste Físico de Existencias ({adjustingItem})
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Nuevo Conteo Físico en Bodega:
              </label>
              <input
                type="number"
                min="0"
                value={adjustedQty}
                onChange={(e) => setAdjustedQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Motivo / Justificación:
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdjustingItem(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAdjust}
                className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Guardar y Asentar Kardex
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <InvoiceUploadModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      <TablewareAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};
