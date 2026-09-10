export interface AlumnoGrupoResponseV2 {
  content: AlumnoGrupoV2[];
  page: PageAlumnoGrupo;
}

export interface PageAlumnoGrupo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface AlumnoGrupoV2 {
  alumnoId: number;
  alumnoExamenId: number;

  folio: string;
  curp: string;

  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;

  sexo: string;

  cct: string;
  nombreEscuela: string;

  grupo: string;
  turno: string;

  examenId: number;
  examen: string;

  ciclo: number;
  nivel: string;
}

export interface ResultadoAlumnoV2 {
  alumnoId: number;

  folio: string;
  nombreCompleto: string;

  examenId: number;
  examen: string;

  ciclo: number;
  nivel: string;

  tipoEvaluacion: string;

  puntajeObtenido: number;
  puntajeMaximo: number;

  totalPreguntas: number;
  totalAciertos: number;

  porcentajeGeneral: number;

  resultadosPorMateria: ResultadoMateriaAlumnoV2[];
}

export interface ResultadoMateriaAlumnoV2 {
  materiaId: number;
  materia: string;

  asistio: boolean;

  tipoEvaluacion: string;

  puntajeObtenido: number;
  puntajeMaximo: number;

  totalPreguntas: number;
  respuestasRegistradas: number;

  aciertos: number;

  porcentaje: number;

  estado: string;
}

export interface ResultadoPreguntaAlumnoV2 {
  alumnoExamenId: number;

  alumnoId: number;

  folio: string;

  nombreCompleto: string;

  examenId: number;
  examen: string;

  ciclo: number;
  nivel: string;

  materiaId: number;
  materia: string;

  asistio: boolean;

  tipoEvaluacion: string;

  puntajeObtenido: number;
  puntajeMaximo: number;

  totalPreguntas: number;
  respuestasRegistradas: number;

  aciertos: number;

  porcentaje: number;

  estado: string;

  preguntas: PreguntaAlumnoV2[];
}

export interface PreguntaAlumnoV2 {
  preguntaId: number;

  numeroPregunta: number;

  contenido: string;

  unidadId: number;
  unidad: string;

  respuestaAlumno: string | number | null;

  respuestaCorrecta:
    string |
    number |
    null;

  esCorrecta: boolean | null;

  nivelObtenido:
    number |
    string |
    null;

  puntajeObtenido: number;

  puntajeMaximo: number;

  respondida: boolean;
}