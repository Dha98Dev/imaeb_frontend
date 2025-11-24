import { Injectable } from '@angular/core';
import { CryptoJsService } from '../CriptoJs/cryptojs.service';

@Injectable({providedIn: 'root'})
export class StorageService {
    constructor(private crypjsService:CryptoJsService) { }

    saveAlumnoSeleccionado(idAlumno:any){
        let idCript=this.crypjsService.Encriptar(idAlumno.toString())
        // AS alumno seleccionado Alumno se
        sessionStorage.setItem('AS', idCript)
    }
    getAlSeleccionado(){
        let id = sessionStorage.getItem('AS')
        if (id) {
            return this.crypjsService.Desencriptar(id)
        }else{
            return null
        }
    }
    getCriptAlSeleccionado(){
        return sessionStorage.getItem('AS')
    }
    deleteAlSeleccionado(){
        sessionStorage.removeItem('AS')
    }
}