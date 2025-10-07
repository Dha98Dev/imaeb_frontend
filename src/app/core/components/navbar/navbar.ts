import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  items: MenuItem[] | undefined;
  constructor(private router:Router){}

  ngOnInit() {
    this.items = [
      {
        label: 'Nuevo filtro',
        icon: 'pi pi-home',
        command : e=> this.router.navigate(['/Auth/main-filter'])
      },
      {
        label: 'Estadistica General',
        icon: 'pi pi-chart-bar',
        command: e => this.router.navigate(['/e/estadistica-general'])
      }
    ]
  }
}
