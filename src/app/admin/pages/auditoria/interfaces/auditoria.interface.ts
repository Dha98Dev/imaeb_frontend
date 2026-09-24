export type AuditoriaResultado = 'EXITOSO' | 'RECHAZADO' | 'FALLIDO';

export interface AuditoriaCampoModificado {
  campo: string;
  valorAnterior: unknown;
  valorNuevo: unknown;
}

export interface AuditoriaEvento {
  id: string;
  fechaHora: string;
  actorId: number | null;
  actorUsername: string | null;
  actorTipo: string;
  actorSistema: string | null;
  accion: string;
  recursoTipo: string;
  recursoId: string | null;
  usuarioDestinoId: number | null;
  usuarioDestinoUsername: string | null;
  resultado: AuditoriaResultado;
  motivoCodigo: string | null;
  descripcion: string | null;
  camposModificados: AuditoriaCampoModificado[];
  correlacionId: string | null;
}

export interface AuditoriasResponse {
  content: AuditoriaEvento[];
  page: AuditoriaPage;
}

export interface AuditoriaPage {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface AuditoriaFiltros {
  desde?: string;
  hasta?: string;
  actorId?: number;
  usuarioDestinoId?: number;
  accion?: string;
  resultado?: AuditoriaResultado;
  page?: number;
  size?: number;
}

export interface AuditoriaResultadoOpcion {
  label: string;
  value: AuditoriaResultado;
}

export interface PaginacionEvento {
  page?: number;
  rows?: number;
}
