export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
}

export interface AuthMeResponse {
  id: number;
  username: string;
  tipoPersona: string;
  scope: string;
  activo: boolean;
  autoridades: string[];
  alcances: AuthAlcance[];
  centros: AuthCentro[];
}

export interface AuthAlcance {
  id: number;
  scope: string;
  accesoGlobal: boolean;
  cicloId: number | null;
  nivelId: number | null;
  modalidadId: number | null;
  sectorId: number | null;
  zonaId: number | null;
  escuelaId: number | null;
  escuelaGrupoId: number | null;
  personaId: number | null;
  dependenciaId: number | null;
}

export interface AuthCentro {
  id: number;
  escuelaId: number;
  cct: string;
  escuelaGrupoId: number | null;
  materiaId: number | null;
  cargo: string;
}