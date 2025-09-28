import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Enviroments } from '../../../enviroments/env';
import { BehaviorSubject } from 'rxjs';
import { DatosCct } from '../../Interfaces/DatosCct.interface';

@Injectable({ providedIn: 'root' })
export class GetCctInfoSErvice {
    private urlservice: string = Enviroments.UrlServiceBackend

    constructor(private http: HttpClient) { }

    private centroTrabajoSubject = new BehaviorSubject<any>(null)
    centroTrabajo$ = this.centroTrabajoSubject.asObservable()

    private cctSubject = new BehaviorSubject<any>(null)
    cct$ = this.cctSubject.asObservable()

    private grupoSubject = new BehaviorSubject<any>(null)
    grupo$ = this.grupoSubject.asObservable()

    private zonaSubject = new BehaviorSubject<any>(null)
    zona$ = this.zonaSubject.asObservable()

    private nivelSubject = new BehaviorSubject<any>(null)
    nivel$ = this.nivelSubject.asObservable()


    setCentroTrabajo(data: any) {
        this.centroTrabajoSubject.next(data)
    }
    setCct(cct: string) {
        this.cctSubject.next(cct)
    }
    setGrupo(grupo: string) {
        this.grupoSubject.next(grupo)
    }
    setZona(zona: string) {
        this.zonaSubject.next(zona)
    }
    setNivel(nivel: string) {
        this.nivelSubject.next(nivel)
    }

    getInfoCct(cct: string) {
        let params = new HttpParams()
            .set('cct', cct)
        return this.http.get<any>(this.urlservice + 'api/centros-trabajo/info', { params })
    }
    getIdNivel(): number | null {
        const data = this.centroTrabajoSubject.value;
        return data ? data.idNivel : null;
    }


}