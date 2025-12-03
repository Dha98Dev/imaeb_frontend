import { ChangeDetectorRef, Component } from '@angular/core';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  constructor(
    private breadCrumb: BreadCrumService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService,
    private cd:ChangeDetectorRef
  ) {}
  showPassword = false;
  loader: boolean = false;
  public loginForm: FormGroup = {} as FormGroup;

  ngOnInit() {
    this.breadCrumb.addItem({
      jerarquia: 1,
      icon: '',
      label: 'login',
      urlLink: '/Auth/login',
      home: '',
    });
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }
  iniciarSesion() {
    if (this.loginForm.valid) {
      this.loader = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (resp) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Acceso correcto',
            detail: 'Bienvenido de nuevo',
          });
          this.loader = false;
          this.cd.detectChanges()
          setTimeout(() => {
          }, 1000);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'ocurrio un error al iniciar sesion',
          });
          this.loader = false;
        },
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Todos los campos son requeridos',
      });
    }
  }
}
