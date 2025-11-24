import { Resultado } from "./resultadoPorcentajeAciertosMateria.interface";

export interface Alumno {
    apellidoMaterno: string;
    apellidoPaterno: string;
    idAlumno:         string,
    materias:         Materia[];
    nombre:           string;
    sexo:             string;
    cct:              datosCct,
    resultados ?: Resultado[],
    promedioGeneral: number,
    datosEscolares:DatosEscolares
}

export interface datosCct{
    turno:            string;
    cct:              string;
    grupo:            string;
    nivel:            string;
    nombre_cct:       string;

}

export interface Materia {
    nombre:             string;
    preguntas:          Pregunta[];
}

export interface Pregunta {
    numeroPregunta: number;
    pda:            string;
    respuesta:      string;
    materia:        string;
    especificacion: string;
    contenido:      string;
    unidad:         string;
}

export interface DatosEscolares{
grado:string,
grupo:string,
nivel:string,
nombreEscuela:string,
cct:string
}

export interface AlumnoFormateado{
    nombre:string,
    apellido_paterno:string,
    apellido_materno:string,
    // id:string,
    promedio_estatal:number,
    respuestas:Respuesta[],
    sexo:string,
    idAlumno:string
    promedioAlumno:number
}

export interface Respuesta {
  pregunta: number;
  respuesta: number;
  inicialMateria:string,
  encabezado:string
}