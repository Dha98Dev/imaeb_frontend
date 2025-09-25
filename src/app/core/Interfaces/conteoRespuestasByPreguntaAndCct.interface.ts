export interface PreguntaStat {
  materia: string;
  unidad: string;
  numeroPregunta: number;
  contenido: string;
  respuestaCorrecta: string; // o number si la manejas como dígito
  totalRespuestas: number;
  respuestasCorrectas: number;
  respuestasIncorrectas: number;
  porcentajeAciertos: number;
  porcentajeDesaciertos: number;
}

export interface GrupoPorUnidad {
  unidad: string;
  preguntas: PreguntaStat[];
}