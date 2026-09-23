export interface UsuarioAdmin {
  id: number;
  username: string;
  personaId: number | null;
  nombreCompleto: string;
  tipoPersonaId: number | null;
  tipoPersona: string;
  scope: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface UsuariosAdminResponse {
  content: UsuarioAdmin[];
  page: UsuariosAdminPage;
}

export interface UsuariosAdminPage {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface UsuariosAdminFiltros {
  username?: string;
  scope?: string;
  activo?: boolean;
  nivelId?: number[];
  modalidadId?: number[];
  sectorId?: number;
  zonaId?: number;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface CambiarPasswordUsuarioRequest {
  nuevaPassword: string;
}

export interface CambiarEstadoUsuarioRequest {
  activo: boolean;
}

export interface ActualizarUsuarioRequest {
  username?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string | null;
  sexo?: string | null;
}

export interface UsuarioActualizadoResponse {
  id: number;
  username: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  sexo: string | null;
}

export interface TipoUsuario {
  id: string;
  descripcion: string;
  estado: string;
  scope: string;
}

export interface UsuarioAdminVista extends UsuarioAdmin {
  estadoTexto: string;
  fechaCreacionTexto: string;
}

export interface DatosCuentaFormValue {
  username: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
}