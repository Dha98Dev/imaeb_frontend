import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Enviroments } from '../../../enviroments/env';
import { modalidad } from '../../Interfaces/Modalidad.interface';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ModalidadesService {
    constructor(private http:HttpClient) { }
    private url:string= Enviroments.UrlServiceBackend
    getModalidadesNivel(nivel:number): Observable<modalidad[]>{
        let params = new HttpParams()
        .set('nivelId', nivel)
        return this.http.get<modalidad[]>(this.url+'api/modalidades/nivel', {params:params})
    }

}