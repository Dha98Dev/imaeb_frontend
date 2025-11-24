import { Component } from '@angular/core';
import { Background } from '../../../core/enums/background.enum';

@Component({
  selector: 'app-principal-director-preescolar',
  standalone: false,
  templateUrl: './principal-director-preescolar.html',
  styleUrl: './principal-director-preescolar.scss'
})
export class PrincipalDirectorPreescolar {

  public fondos=Background
}
