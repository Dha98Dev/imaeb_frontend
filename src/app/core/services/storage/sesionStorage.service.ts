import { Injectable } from '@angular/core';
import { CryptoJsService } from '../CriptoJs/cryptojs.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private crypjsService: CryptoJsService) {}

  saveAlumnoSeleccionado(idAlumno: number, examenId: number, alumnoExamenId: number): void {
    const idAlumnoCript = this.crypjsService.Encriptar(idAlumno.toString());
    const examenIdCript = this.crypjsService.Encriptar(examenId.toString());
    const alumnoExamenIdCript = this.crypjsService.Encriptar(alumnoExamenId.toString());

    sessionStorage.setItem('AS', idAlumnoCript);
    sessionStorage.setItem('AES', examenIdCript);
    sessionStorage.setItem('AEXS', alumnoExamenIdCript);
  }

  getAlSeleccionado(): string | null {
    const id = sessionStorage.getItem('AS');

    if (!id) {
      return null;
    }

    return this.crypjsService.Desencriptar(id);
  }

  getCriptAlSeleccionado(): string | null {
    return sessionStorage.getItem('AS');
  }

  getExamen(): number | null {
    const examen = sessionStorage.getItem('AES');

    if (!examen) {
      return null;
    }

    const examenId = Number(this.crypjsService.Desencriptar(examen));

    return Number.isNaN(examenId) ? null : examenId;
  }

  getExamenSeleccionado(): number | null {
    return this.getExamen();
  }

  getCriptExamenSeleccionado(): string | null {
    return sessionStorage.getItem('AES');
  }

  getAlumnoExamenId(): number | null {
    const alumnoExamen = sessionStorage.getItem('AEXS');

    if (!alumnoExamen) {
      return null;
    }

    const alumnoExamenId = Number(this.crypjsService.Desencriptar(alumnoExamen));

    return Number.isNaN(alumnoExamenId) ? null : alumnoExamenId;
  }

  getCriptAlumnoExamenId(): string | null {
    return sessionStorage.getItem('AEXS');
  }

  deleteAlSeleccionado(): void {
    sessionStorage.removeItem('AS');
    sessionStorage.removeItem('AES');
    sessionStorage.removeItem('AEXS');
  }
}
