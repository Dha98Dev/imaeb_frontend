import { Component } from '@angular/core';
import { Background } from '../../../core/enums/background.enum';

@Component({
  selector: 'app-principal-padre-preescolar',
  standalone: false,
  templateUrl: './principal-padre-preescolar.html',
  styleUrl: './principal-padre-preescolar.scss'
})
export class PrincipalPadrePreescolar {
public fondos=Background
}
