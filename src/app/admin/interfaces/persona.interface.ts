export interface Persona {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  curp: string | null;
  identificadorProvisional: boolean;
  tipoPersonaId: number;
  tipoPersona: string;
  scope: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface CrearPersonaRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  curp: string | null;
  tipoPersonaId: number;
}

export interface BuscarPersonasParams {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  curp?: string;
  tipoPersonaId?: number;
  activo?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PersonaPage {
  content: Persona[];

  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}