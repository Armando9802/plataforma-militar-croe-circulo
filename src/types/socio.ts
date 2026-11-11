export interface Dependent {
  id: string;
  nombres: string;
  parentesco: 'CÓNYUGE' | 'HIJO' | 'HIJA' | 'PADRE' | 'MADRE';
  cedula: string;
  carneAutorizado: boolean;
  fotoUrl?: string;
}

export interface SocioProfile {
  id: string;
  codigoMilitar: string;
  cedula: string;
  grado: string;
  apellidos: string;
  nombres: string;
  arma: string;
  estadoSocio: 'ACTIVO' | 'VITALICIO' | 'HONORARIO' | 'SUSPENDIDO';
  categoria: string;
  fechaIngreso: string;
  antiguedadAnios: number;
  cuotaAlDia: boolean;
  ultimaCuotaPagada: string;
  montoCuotaMensual: number;
  sedeHabitual: string;
  vehiculoPlaca?: string;
  telefono: string;
  email: string;
  fotoUrl: string;
  dependientes: Dependent[];
  qrPayload?: string;
}
