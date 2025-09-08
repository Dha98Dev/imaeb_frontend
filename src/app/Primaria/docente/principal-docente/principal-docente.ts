import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal-docente',
  standalone: false,
  templateUrl: './principal-docente.html',
  styleUrl: './principal-docente.scss'
})
export class PrincipalDocente {
constructor(){}
private jerarquia:number=8
public porcentajeNinos:number=54.5
public porcentajeNinas:number=45.5

materiaSelected(materia:any){
  // this._router.navigate(['resultados-grupo-area'])
}
}
