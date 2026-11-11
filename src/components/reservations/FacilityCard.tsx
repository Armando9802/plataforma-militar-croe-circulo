import React from 'react';
import { Facility } from '../../types/reservation';
import { useTenant } from '../../context/TenantContext';
import {
  Users,
  MapPin,
  Sparkles,
  Check,
  Calendar,
  Clock,
  ShieldCheck,
  Home,
  Trophy,
} from 'lucide-react';

interface FacilityCardProps {
  facility: Facility;
  onSelect: (facility: Facility) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onSelect }) => {
  const { currentTenant } = useTenant();

  const isLodging = facility.category === 'lodging';
  const discountSavings = Math.max(0, facility.guestPrice - facility.memberPrice);
  const discountPercent =
    facility.guestPrice > 0 ? Math.round((discountSavings / facility.guestPrice) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-slate-300">
      <div>
        {/* Facility Image with overlay badges */}
        <div className="relative h-52 overflow-hidden bg-slate-900">
          <img
            src={facility.imageUrl}
            alt={facility.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Subcategory & Category Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-amber-300 border border-white/10 shadow-sm">
              {isLodging ? <Home className="w-3 h-3 text-amber-400" /> : <Trophy className="w-3 h-3 text-amber-400" />}
              <span>{facility.subcategory}</span>
            </span>

            {discountPercent > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600/90 backdrop-blur-md text-[10px] font-bold text-white shadow-sm border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3" />
                <span>{discountPercent}% Subsidio</span>
              </span>
            )}
          </div>

          {/* Location pill */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-slate-200 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md">
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate max-w-[200px]">{facility.location}</span>
          </div>

          {/* Member Price Badge */}
          <div className="absolute bottom-3 right-3 text-right">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 border border-emerald-400/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                Tarifa Militar: ${facility.memberPrice} / {facility.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3.5">
          {/* Header & Capacity */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg leading-snug group-hover:text-primary transition-colors">
                {facility.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {facility.subcategory} · {isLodging ? 'Alojamiento Exclusivo' : 'Instalación Deportiva'}
              </p>
            </div>

            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 shrink-0 border border-slate-200"
              title={`Capacidad máxima: ${facility.capacity} personas`}
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Hasta {facility.capacity} pax</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {facility.description}
          </p>

          {/* Amenities pills */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex flex-wrap gap-1.5">
              {facility.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </span>
              ))}
              {facility.amenities.length > 4 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-slate-400">
                  +{facility.amenities.length - 4} más
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Pricing breakdown & CTA */}
      <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-500">
            Invitados: ${facility.guestPrice} / {facility.unit}
          </span>
          {discountSavings > 0 ? (
            <span className="text-[10px] font-bold text-emerald-700">
              Ahorro socio: ${discountSavings}.00 / {facility.unit}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400">
              Tarifa estándar
            </span>
          )}
        </div>

        <button
          onClick={() => onSelect(facility)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all transform active:scale-95 focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: currentTenant.theme.primaryColor,
          }}
          aria-label={`Reservar Ahora ${facility.name}`}
        >
          {isLodging ? (
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-amber-300" />
          )}
          <span>Reservar Ahora</span>
        </button>
      </div>
    </div>
  );
};
