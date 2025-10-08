import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Enviroments } from '../../../enviroments/env';
import { catalogo, MunicipiosOrLocalidades, responseCatalogo } from '../../Interfaces/catalogo.interface';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class CatalogoService {
    private url:string=Enviroments.UrlServiceBackend
    constructor(private http:HttpClient) { }
getCatalogo(data: catalogo): Observable<responseCatalogo> {
  let params = new HttpParams();

  if (data.nivelId != null) {
    params = params.set('nivelId', data.nivelId.toString());
  } 
  if (data.modalidadId != null) {
    params = params.set('modalidadId', data.modalidadId.toString());
  }

  if (data.sector != null) {   // 👈 así no se salta el 0
    params = params.set('sector', data.sector.toString());
  }

  if (data.zonaEscolar != null) {
    params = params.set('zonaEscolar', data.zonaEscolar.toString());
  }

  return this.http.get<responseCatalogo>(
    this.url + 'api/catalogos/flujo-completo',
    { params }
  );
}

getMunicipios():Observable<MunicipiosOrLocalidades[]>{
  return this.http.get<MunicipiosOrLocalidades[]>(this.url + 'api/catalogos/municipios')
}
getLocalidades(idMun:number):Observable<MunicipiosOrLocalidades[]>{
  let params = new HttpParams()
  .set('municipioId', idMun)
  return this.http.get<MunicipiosOrLocalidades[]>(this.url + 'api/catalogos/localidades/municipio', {params})
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