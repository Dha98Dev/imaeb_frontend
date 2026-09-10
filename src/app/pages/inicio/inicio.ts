import { Component } from '@angular/core';
import { AuthService } from '../../Auth/services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  constructor(private authService: AuthService) {}
  protected isAutenticated: boolean = false;

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((state) => {
      this.isAutenticated = state;
    });
  }
}
