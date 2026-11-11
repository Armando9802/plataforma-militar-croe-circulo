import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { SupplierInvoice } from '../../types/inventory';
import {
  X,
  Upload,
  CheckCircle2,
  Building2,
  Receipt,
  ShieldCheck,
  PackagePlus,
  Sparkles,
} from 'lucide-react';

interface InvoiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceUploadModal: React.FC<InvoiceUploadModalProps> = ({ isOpen, onClose }) => {
  const { invoices, processSupplierInvoice } = useInventory();
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(
    invoices[0] || null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (inv: SupplierInvoice) => {
    setSelectedInvoice(inv);
    setSuccessMessage(null);
  };

  const handleConfirmIngreso = () => {
    if (!selectedInvoice) return;

    const ok = processSupplierInvoice(selectedInvoice.id);
    if (ok) {
      setSuccessMessage(
        `¡Factura ${selectedInvoice.invoiceNumber} procesada exitosamente! Se actualizaron ${selectedInvoice.items.length} artículos en bodega y se generaron los asientos de ENTRADA en el Kardex.`
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Simulate auto-selecting a preset based on dropped file
    if (invoices.length > 0) {
      setSelectedInvoice(invoices[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg">
                Recepción & Carga de Facturas Electrónicas (SRI)
              </h2>
              <p className="text-xs text-slate-300">
                Adquisición de víveres, menaje e insumos con ingreso automático al Kardex
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick 1-Click Demo Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Precargas Rápidas de Demostración (Proveedores Oficiales Ecuador):
              </label>
              <span className="text-[11px] text-slate-400">1-clic para reunión ejecutiva</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                const isProcessed = inv.status === 'PROCESSED';

                return (
                  <button
                    key={inv.id}
                    onClick={() => handleSelectPreset(inv)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 truncate block max-w-[140px]">
                        {inv.supplierName.split(' ')[0]}
                      </span>
                      {isProcessed ? (
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          INGRESADO
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          PENDIENTE
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">FAC: {inv.invoiceNumber}</p>
                    <p className="text-[11px] font-bold text-slate-700 mt-1">
                      ${inv.total.toFixed(2)} USD
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50/40'
                : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/50'
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Arrastre aquí el archivo <span className="text-emerald-700 font-bold">XML del SRI</span> o <span className="text-slate-900 font-bold">PDF de la Factura</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Simulación de extracción de RUC, clave de acceso de 49 dígitos y desglose con 15% IVA
            </p>
          </div>

          {/* Extracted Invoice Details Card */}
          {selectedInvoice && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Proveedor</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {selectedInvoice.supplierName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">RUC SRI</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {selectedInvoice.supplierRuc}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">N.º Factura</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {selectedInvoice.invoiceNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Condición</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedInvoice.paymentTerms}
                  </span>
                </div>
              </div>

              {/* 49-Digit SRI Access Key */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate text-left">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">
                    Clave de Acceso SRI (49 Dígitos Autorizada)
                  </span>
                  <span className="font-mono text-[10px] text-slate-700 block truncate">
                    {selectedInvoice.accessKey49}
                  </span>
                </div>
              </div>

              {/* Line items table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-200/70 text-slate-700 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Descripción del Ítem</th>
                      <th className="px-3 py-2 text-right">Cant.</th>
                      <th className="px-3 py-2 text-right">P. Unit</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px] bg-white">
                    {selectedInvoice.items.map((line) => (
                      <tr key={line.itemCode}>
                        <td className="px-3 py-2 text-slate-500">{line.itemCode}</td>
                        <td className="px-3 py-2 font-sans font-medium text-slate-800">
                          {line.itemName}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-700 font-bold">
                          +{line.quantity} {line.unit}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-600">
                          ${line.unitCost.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          ${line.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals with 15% IVA */}
              <div className="flex justify-end pt-2 border-t border-slate-200">
                <div className="w-56 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Grabado:</span>
                    <span className="font-mono font-semibold">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>IVA SRI (15%):</span>
                    <span className="font-mono font-semibold">${selectedInvoice.vat15.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-1">
                    <span>Total Liquidado:</span>
                    <span className="font-mono text-emerald-700">
                      ${selectedInvoice.total.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <p className="font-bold">{successMessage}</p>
                <p className="mt-1 text-[11px] text-emerald-700">
                  Las alertas de stock asociadas a estos ítems se han mitigado automáticamente en el economato.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cerrar Ventana
          </button>

          <button
            onClick={handleConfirmIngreso}
            disabled={!selectedInvoice || selectedInvoice.status === 'PROCESSED'}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
              selectedInvoice?.status === 'PROCESSED'
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>
              {selectedInvoice?.status === 'PROCESSED'
                ? 'Factura Ya Ingresada a Bodega'
                : 'Confirmar Ingreso a Bodega & Asentar Kardex'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
