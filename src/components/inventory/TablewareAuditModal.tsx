import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { TablewareAuditItem } from '../../types/inventory';
import {
  X,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  ClipboardCheck,
} from 'lucide-react';

interface TablewareAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TablewareAuditModal: React.FC<TablewareAuditModalProps> = ({ isOpen, onClose }) => {
  const { settleEventTableware } = useInventory();

  // Demo event data
  const eventName = 'Banquete de Ascenso Militar (100 PAX)';
  const responsible = 'Sgto. Mayordomo P. Tapia';

  const [audits, setAudits] = useState<TablewareAuditItem[]>([
    {
      itemCode: 'MEN-PLA-01',
      name: 'Platos Llanos Porcelana Escudo Dorado',
      assignedQty: 100,
      returnedIntactQty: 96,
      brokenOrLostQty: 4,
      unitReplacementCost: 6.20,
      totalLossCost: 24.80,
    },
    {
      itemCode: 'MEN-CUB-02',
      name: 'Juegos Cubiertos Acero Inoxidable 18/10',
      assignedQty: 100,
      returnedIntactQty: 98,
      brokenOrLostQty: 2,
      unitReplacementCost: 4.50,
      totalLossCost: 9.00,
    },
    {
      itemCode: 'MEN-COP-03',
      name: 'Copas de Cristal Templado Agua/Vino',
      assignedQty: 150,
      returnedIntactQty: 142,
      brokenOrLostQty: 8,
      unitReplacementCost: 3.80,
      totalLossCost: 30.40,
    },
  ]);

  const [settledResult, setSettledResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuditChange = (
    itemCode: string,
    field: 'returnedIntactQty' | 'brokenOrLostQty',
    val: number
  ) => {
    setAudits((prev) =>
      prev.map((item) => {
        if (item.itemCode !== itemCode) return item;
        const numVal = Math.max(0, isNaN(val) ? 0 : val);

        let returned = field === 'returnedIntactQty' ? numVal : item.returnedIntactQty;
        let broken = field === 'brokenOrLostQty' ? numVal : item.brokenOrLostQty;

        // Auto adjust if sum exceeds assigned
        if (returned + broken > item.assignedQty) {
          if (field === 'returnedIntactQty') {
            broken = Math.max(0, item.assignedQty - returned);
          } else {
            returned = Math.max(0, item.assignedQty - broken);
          }
        }

        const totalLoss = Math.round(broken * item.unitReplacementCost * 100) / 100;
        return {
          ...item,
          returnedIntactQty: returned,
          brokenOrLostQty: broken,
          totalLossCost: totalLoss,
        };
      })
    );
  };

  const totalLoss = audits.reduce((sum, item) => sum + item.totalLossCost, 0);

  const handleConfirmAudit = () => {
    const record = settleEventTableware({
      eventName,
      eventDate: new Date().toISOString().split('T')[0],
      pax: 100,
      responsible,
      audits,
      notes: `Auditoría post-evento. ${audits.reduce((acc, a) => acc + a.brokenOrLostQty, 0)} piezas averiadas.`,
    });

    setSettledResult(
      `¡Auditoría liquidada con éxito! Se reincorporó la vajilla íntegra a bodega y se registró un débito de $${record.totalBreakageCost.toFixed(
        2
      )} USD por reposición en el Kardex (MERMA_ROTURA).`
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg">
                Auditoría de Menaje & Cierre de Eventos
              </h2>
              <p className="text-xs text-slate-300">
                Inspección de vajilla y cristalería: Retorno íntegro vs. Mermas por rotura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Event Context Header */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Evento a Liquidar</span>
              <span className="font-bold text-slate-800 text-sm">{eventName}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Responsable de Mayordomía</span>
              <span className="font-semibold text-slate-700">{responsible}</span>
            </div>
          </div>

          {/* Audit Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Menaje Despachado</th>
                  <th className="px-3 py-2.5 text-center">Despachado</th>
                  <th className="px-3 py-2.5 text-center">Devuelto Sano</th>
                  <th className="px-3 py-2.5 text-center">Roto / Extraviado</th>
                  <th className="px-3 py-2.5 text-right">Reposición ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {audits.map((item) => (
                  <tr key={item.itemCode} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.itemCode}</span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-slate-700">
                      {item.assignedQty}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max={item.assignedQty}
                        value={item.returnedIntactQty}
                        onChange={(e) =>
                          handleAuditChange(
                            item.itemCode,
                            'returnedIntactQty',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16 text-center py-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max={item.assignedQty}
                        value={item.brokenOrLostQty}
                        onChange={(e) =>
                          handleAuditChange(
                            item.itemCode,
                            'brokenOrLostQty',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16 text-center py-1 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">
                      ${item.totalLossCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Breakage Cost Summary */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <div>
                <p className="font-bold text-xs text-rose-900">
                  Cargo Total por Reposición de Vajilla Rota:
                </p>
                <p className="text-[11px] text-rose-700">
                  Se asienta como MERMA_ROTURA en el Kardex y se carga a la cuenta del evento.
                </p>
              </div>
            </div>
            <span className="font-serif font-black text-lg text-rose-700">
              ${totalLoss.toFixed(2)} USD
            </span>
          </div>

          {/* Success Banner */}
          {settledResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <p className="font-bold">{settledResult}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cerrar
          </button>
          <button
            onClick={handleConfirmAudit}
            disabled={!!settledResult}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
              settledResult
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {settledResult ? 'Evento Ya Liquidado' : 'Cerrar Evento y Registrar en Kardex'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
