import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Enviroments } from '../../../enviroments/env';
import { catalogo, responseCatalogo } from '../../Interfaces/catalogo.interface';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class CatalogoService {
    private url:string=Enviroments.UrlServiceBackend
    constructor(private http:HttpClient) { }
        getCatalogo(data:catalogo):Observable<responseCatalogo> {
        let params = new HttpParams();

        if (data.nivelId) params = params.set('nivelId', data.nivelId.toString());
        if (data.sector) params = params.set('sector', data.sector.toString());
        if (data.zonaEscolar) params = params.set('zonaEscolar', data.zonaEscolar.toString());

        return this.http.get<responseCatalogo>(this.url + 'api/catalogos/flujo-completo', { params })
    }
  getNivelDescription(nivel:string) {
    switch (nivel) {
      case '1': return 'Preescolar'
      case '2': return 'Primaria'
      case '3': return 'Secundaria'
      default:
        return ''
    }
  }
  getNombreMateria(materia: number) {
    switch (materia) {
      case 1: return 'Lenguajes'
      case 2: return 'Saberes y pensamiento científico'
      case 3: return 'Matemáticas'
      case 4: return 'Ciencias'
      default:
        return ''
    }
  }
}