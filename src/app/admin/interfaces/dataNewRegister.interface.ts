import { singleModalidad } from "../../core/Interfaces/catalogo.interface";

export interface modalidadesNivel{
    idNivel:number,
    modalidades:singleModalidad[]
}
export interface modalidadesSelectedByNivel{
    idNivel:number,
    modalidadesSelected:number[]
}

