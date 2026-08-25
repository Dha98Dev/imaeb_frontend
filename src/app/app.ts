import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('imaeb2.0');
  ngOnInit(){
        const origin = window.location.origin;
        if (origin.includes('https://srv37app00')) {
            window.location.href = 'https://consultarvoe.sepen.gob.mx/'
        }
  }
}
