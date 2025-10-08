import { CentrosTrabajo, Sectores } from "./catalogo.interface"

export interface resultadosModalidad {
    nivel: number | string,
    promedioNivel: number,
    modalidad: string,
    promedioModalidad: number,
    sector: number,
    promedioSector: number,
    zona: number,
    promedioZona: number,
    cct: string,
    promedioCct: number
}

export interface dataModalidad {
    nivel: string,
    modalidad: string
    sectores: SectoresModalidad[]
}

 export interface SectoresModalidad {
    sector: number,
    zonas: zonasModalidad[]
}

 export interface zonasModalidad {
    zona: number,
    cct:CentrosTrabajo[]
}