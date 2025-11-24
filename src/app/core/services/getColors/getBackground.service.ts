import { Injectable } from '@angular/core';
import { backgroundNivel } from '../../Interfaces/Background.interface';

@Injectable({ providedIn: 'root' })
export class GetBackgroundService {
    constructor() { }
    getBackgroundMateria(materia: string) {
        let claseSeleccionada = '';
        switch (materia) {
            case 'Lenguajes':
                claseSeleccionada = 'bg-blue'
                break;
            case 'Saberes y pensamiento científico':
                claseSeleccionada = 'bg-c1'
                break;
            case 'Matemáticas':
                claseSeleccionada = 'bg-green'
                break;
            case 'Ciencias':
                claseSeleccionada = 'bg-orange'
                break;
            default:
                claseSeleccionada='bg-c1'
                break;
        }
        return claseSeleccionada
    }


    getnivelAprendizaje(porcentaje:number):backgroundNivel{
    if (porcentaje > 75 && porcentaje <=100) {
        return {text:'Satisfactorio', color:'bg-green'}
    }
    else if(porcentaje > 50  && porcentaje <= 75){
        return {text:'Básico', color:'bg-yellow'}
    }else if(porcentaje > 25 && porcentaje <= 50){
        return {text:'Elemental', color:'bg-orange'}
    }else if(porcentaje >=  0 && porcentaje <=25) {
        return {text:'Insuficiente', color:'bg-red'}
        
    }
    return {} as backgroundNivel
    }
}