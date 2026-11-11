import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useTenant } from '../../context/TenantContext';
import { KardexMovementType } from '../../types/inventory';
import {
  FileText,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  AlertTriangle,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const KardexAuditView: React.FC = () => {
  const { kardex } = useInventory();
  const { currentTenant } = useTenant();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredEntries = useMemo(() => {
    return kardex.filter((entry) => {
      const matchesSearch =
        entry.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.referenceDoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.responsible.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || entry.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [kardex, searchTerm, typeFilter]);

  const getMovementBadge = (type: KardexMovementType) => {
    switch (type) {
      case 'IN_PURCHASE':
        return {
          label: 'ENTRADA COMPRA',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: ArrowDownLeft,
        };
      case 'OUT_SHIFT':
        return {
          label: 'SALIDA TURNO',
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: ArrowUpRight,
        };
      case 'OUT_EVENT':
        return {
          label: 'DESPACHO EVENTO',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          icon: ArrowUpRight,
        };
      case 'RETURN_EQUIPMENT':
        return {
          label: 'RETORNO MENAJE',
          bg: 'bg-teal-100 text-teal-800 border-teal-300',
          icon: RotateCcw,
        };
      case 'LOSS_BREAKAGE':
        return {
          label: 'MERMA / ROTURA',
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: AlertTriangle,
        };
      case 'ADJUSTMENT':
        return {
          label: 'AJUSTE FÍSICO',
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: SlidersHorizontal,
        };
      case 'INITIAL_BALANCE':
      default:
        return {
          label: 'SALDO INICIAL',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: ShieldCheck,
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por artículo, SKU, documento o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 w-full md:w-auto"
          >
            <option value="all">Todos los Movimientos ({kardex.length})</option>
            <option value="IN_PURCHASE">Entrada por Compra (SRI)</option>
            <option value="OUT_SHIFT">Salida por Turno Comedor</option>
            <option value="OUT_EVENT">Despacho de Eventos</option>
            <option value="RETURN_EQUIPMENT">Retorno de Menaje Sano</option>
            <option value="LOSS_BREAKAGE">Merma y Rotura de Vajilla</option>
            <option value="ADJUSTMENT">Ajustes Físicos</option>
            <option value="INITIAL_BALANCE">Saldos Iniciales</option>
          </select>
        </div>
      </div>

      {/* Kardex Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <h3 className="font-serif font-bold text-slate-800 text-base">
              Libro Mayor Kardex Perpetuo — {currentTenant.name}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Mostrando {filteredEntries.length} de {kardex.length} registros
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No se encontraron movimientos registrados</p>
            <p className="text-xs text-slate-400 mt-1">
              Pruebe cambiando los filtros de búsqueda o ejecute un turno de comedor / carga de factura.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Fecha / Hora</th>
                  <th className="px-4 py-3">Tipo Movimiento</th>
                  <th className="px-4 py-3">SKU / Artículo</th>
                  <th className="px-4 py-3 text-right">Cant. Mov.</th>
                  <th className="px-4 py-3 text-right">Stock Previo</th>
                  <th className="px-4 py-3 text-right">Nuevo Saldo</th>
                  <th className="px-4 py-3 text-right">Costo Unit.</th>
                  <th className="px-4 py-3 text-right">Valor Total</th>
                  <th className="px-4 py-3">Documento Ref.</th>
                  <th className="px-4 py-3">Responsable Militar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredEntries.map((row) => {
                  const badge = getMovementBadge(row.type);
                  const Icon = badge.icon;
                  const isPositive = row.quantity > 0;
                  const isZero = row.quantity === 0;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-sans">
                        {new Date(row.timestamp).toLocaleDateString('es-EC', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-sans">
                          <span className="font-bold text-slate-900 block">{row.itemName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{row.itemCode}</span>
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                          isZero
                            ? 'text-slate-500'
                            : isPositive
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {isPositive ? `+${row.quantity}` : row.quantity} {row.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 whitespace-nowrap">
                        {row.previousStock}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {row.newStock}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 whitespace-nowrap">
                        ${row.unitCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800 whitespace-nowrap">
                        ${row.totalValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-sans whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                          {row.referenceDoc}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-sans text-[11px] truncate max-w-[160px]">
                        {row.responsible}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
