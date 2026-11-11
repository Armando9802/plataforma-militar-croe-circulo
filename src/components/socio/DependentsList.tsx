import React from 'react';
import { Dependent } from '../../types/socio';
import { Users, ShieldCheck, Heart, UserCheck, AlertCircle, Award } from 'lucide-react';

interface DependentsListProps {
  dependents: Dependent[];
  className?: string;
  showRegulationsNotice?: boolean;
}

export const DependentsList: React.FC<DependentsListProps> = ({
  dependents,
  className = '',
  showRegulationsNotice = true,
}) => {
  const getParentescoIcon = (parentesco: Dependent['parentesco']) => {
    switch (parentesco) {
      case 'CÓNYUGE':
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'HIJO':
      case 'HIJA':
        return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
      case 'PADRE':
      case 'MADRE':
        return <Award className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Users className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getParentescoColor = (parentesco: Dependent['parentesco']) => {
    switch (parentesco) {
      case 'CÓNYUGE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIJO':
      case 'HIJA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PADRE':
      case 'MADRE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`} data-testid="dependents-list-container">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-700" />
          <h4 className="font-serif font-bold text-slate-900 text-sm uppercase tracking-wider">
            Cargas Familiares Autorizadas ({dependents.length})
          </h4>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          {dependents.length} {dependents.length === 1 ? 'familiar' : 'familiares'}
        </span>
      </div>

      {dependents.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="font-semibold text-slate-700">Sin cargas familiares registradas</p>
          <p className="mt-1">
            El oficial titular no registra cónyuge o hijos dependientes en el sistema de bienestar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="dependents-grid">
          {dependents.map((dep) => (
            <div
              key={dep.id}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
              data-testid={`dependent-card-${dep.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-serif font-bold text-slate-900 text-xs leading-snug">
                    {dep.nombres}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    C.I. <span className="font-semibold text-slate-700">{dep.cedula}</span>
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getParentescoColor(
                    dep.parentesco
                  )}`}
                >
                  {getParentescoIcon(dep.parentesco)}
                  {dep.parentesco}
                </span>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Acceso Garita</span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    dep.carneAutorizado
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {dep.carneAutorizado ? 'Carné Habilitado' : 'En Trámite'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRegulationsNotice && (
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-950">Directiva de Bienestar Social:</strong> Las cargas familiares acreditadas tienen acceso ilimitado a áreas verdes, canchas deportivas, piscinas y convenios institucionales bajo la titularidad del oficial militar.
          </p>
        </div>
      )}
    </div>
  );
};
