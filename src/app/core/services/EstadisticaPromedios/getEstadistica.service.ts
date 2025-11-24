import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Enviroments } from '../../../enviroments/env';
import { ParamsPromediosEstatales } from '../../Interfaces/promediosEstatales.interface';

@Injectable({ providedIn: 'root' })
export class GetEstadisticaService {
    constructor(private http: HttpClient) { }
    private url: string = Enviroments.UrlServiceBackend
    getPromedioEstatalByNivel(data: ParamsPromediosEstatales) {
        let params = new HttpParams();

        if (data.nivelId) params = params.set('nivelId', data.nivelId.toString());
        if (data.materiaId) params = params.set('materiaId', data.materiaId.toString());
        if (data.escuelaId) params = params.set('escuelaId', data.escuelaId.toString());
        if (data.grupoId) params = params.set('grupoId', data.grupoId.toString());
        if (data.personaId) params = params.set('personaId', data.personaId.toString());
        if (data.modalidadId) params = params.set('modalidadId', data.modalidadId.toString());
        if (data.sectorId) params = params.set('sectorId', data.sectorId.toString());
        if (data.zonaId) params = params.set('zonaId', data.zonaId.toString());
        if (data.municipioId) params = params.set('municipioId', data.municipioId.toString());
        if (data.localidadId) params = params.set('localidadId', data.localidadId.toString());

        return this.http.get<any>(this.url + 'estadisticas/promedio/nivel', { params })
    }

}