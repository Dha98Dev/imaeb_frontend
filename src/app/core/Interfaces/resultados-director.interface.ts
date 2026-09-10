export interface ConteoSexoGrupo {
  examenId: number;
  cct: string;
  grupoId: number;
  grupo: string;
  totalParticipantes: number;
  hombres: number;
  mujeres: number;
  sinEspecificar: number;
}

export interface PromedioGrupo {
  examenId: number;
  examen: string;
  ciclo: number;
  tipoEvaluacion: string;
  cct: string;
  grupoId: number;
  grupo: string;
  totalParticipantes: number;
  respuestasRegistradas: number;
  puntajeObtenido: number;
  puntajeMaximo: number;
  aciertos: number;
  porcentaje: number;
}

export interface DesempenioMateriaGrupo {
  examenId: number;
  examen: string;
  ciclo: number;
  tipoEvaluacion: string;
  cct: string;
  grupoId: number;
  grupo: string;
  materiaId: number;
  materia: string;
  totalPreguntas: number;
  totalParticipantes: number;
  respuestasRegistradas: number;
  puntajeObtenido: number;
  puntajeMaximo: number;
  aciertos: number;
  porcentaje: number;
}

export interface ResultadoPregunta {
  examenId: number;
  cct: string;
  materiaId: number;
  materia: string;
  grupoId: number;
  grupo: string;
  preguntaId: number;
  numeroPregunta: number;
  contenido: string;
  unidadId: number;
  unidad: string;
  tipoEvaluacion: string;
  totalParticipantes: number;
  respuestasRegistradas: number;
  aciertos: number;
  puntajeObtenido: number;
  puntajeMaximo: number;
  porcentaje: number;
}

export interface ParticipacionGrupo {
  examenId: number;
  examen: string;
  ciclo: number;
  cct: string;
  grupoId: number;
  grupo: string;
  totalParticipantes: number;
}