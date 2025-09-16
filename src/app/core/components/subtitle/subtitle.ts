import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-subtitle',
  standalone: false,
  templateUrl: './subtitle.html',
  styleUrl: './subtitle.scss'
})
export class Subtitle {
@Input() subtitle:string=''
}
