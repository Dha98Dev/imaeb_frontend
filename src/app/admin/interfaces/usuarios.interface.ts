export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  estado: string;
  username: string;
  scope: string;
  sector: string | null;
  zona: string | null;
  nivel: string;
  modalidad: string;
  nombre_completo:string,
  centro_trabajo:string | null
}


export interface TipoUsuario {
  id: string;
  descripcion: string;
  estado: string;
  scope: string;
}