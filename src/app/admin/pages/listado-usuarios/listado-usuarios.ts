import { ChangeDetectorRef, Component } from '@angular/core';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../interfaces/usuarios.interface';
import { TablaDinamica } from '../../../core/components/tabla-dinamica/tabla-dinamica';
import { DinamicTableData, TableColumn } from '../../../core/Interfaces/TablaDinamica.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-listado-usuarios',
  standalone: false,
  templateUrl: './listado-usuarios.html',
  styleUrl: './listado-usuarios.scss',
})
export class ListadoUsuarios {
  constructor(
    private breadCrumService: BreadCrumService,
    private usuariosService: UsuariosService,
    public cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}
  public visible: boolean = false;
  public listadoUsuarios: Usuario[] = [];
  public dataTable: DinamicTableData = {} as DinamicTableData;
  public usuarioSeleccionado: Usuario = {} as Usuario;
  showPass: boolean = false;
  showConfirm: boolean = false;

  public reestablecerPasswordForm: FormGroup = {} as FormGroup;

  ngOnInit() {
    this.reestablecerPasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    });

    this.breadCrumService.addItem({
      jerarquia: 1,
      label: 'listado de usuarios',
      urlLink: '',
      icon: '',
    });
    this.getListadoUsuarios();
  }
  getListadoUsuarios() {
    this.usuariosService.getListadoUsuarios().subscribe({
      next: (resp) => {
        this.listadoUsuarios = resp.content;
        this.listadoUsuarios.forEach((iu) => {
          iu.nombre_completo = iu.nombre + ' ' + iu.apellido1 + ' ' + iu.apellido2;
          iu.nivel = iu.nivel || 'no definido';
          iu.modalidad = iu.modalidad || 'no definido';
          iu.sector = iu.sector || 'no definido';
          iu.zona = iu.zona || 'no definido';
          iu.centro_trabajo = iu.centro_trabajo || 'no definido';
          iu.scope = iu.scope || 'no definido';
        });

        const columns: TableColumn[] = [
          { key: 'nombre_completo', label: 'Nombre completo', filterable: true },
          { key: 'username', label: 'Usuario', filterable: false },
          { key: 'scope', label: 'Scope', filterable: false },
          { key: 'nivel', label: 'Nivel', filterable: false },
          { key: 'modalidad', label: 'Modalidad', filterable: false },
          { key: 'sector', label: 'Sector', filterable: false },
          { key: 'zona', label: 'Zona', filterable: false },
          { key: 'centro_trabajo', label: 'CCT', filterable: false },
          { key: 'estado', label: 'estado', filterable: false, icon: 'pi pi-check' },
        ];
        this.dataTable = {
          columns: columns,
          data: this.listadoUsuarios,
          globalSearchKeys: [
            'nombre_completo',
            'username',
            'centro_trabajo',
            'nivel',
            'modalidad',
            'sector',
            'zona',
            'estado',
          ],
        };
        this.cd.detectChanges();
      },
      error: (err) => {
      },
    });
  }

  onRow(event: any) {
    this.visible = true;
    this.usuarioSeleccionado = event;
  }
  reestablecerPassword() {
    let password = this.reestablecerPasswordForm.get('password')?.value;
    let confirm = this.reestablecerPasswordForm.get('confirmPassword')?.value;
    if (password != confirm) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nota',
        detail: 'Las contraseñas deben de ser iguales',
        life: 3000,
      });
    } else if (this.reestablecerPasswordForm.valid) {
      this.usuariosService
        .actualizarPassword(
          this.usuarioSeleccionado.idUsuario,
          this.reestablecerPasswordForm.get('password')?.value
        )
        .subscribe({
          next: (resp) => {
            this.messageService.add({
              severity: 'success',
              summary: 'cambio de contraseña exitoso',
              detail: 'Se cambio corrrectamente la contraseña del usuario',
              life: 3000,
            });
            this.visible=false
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Ocurrio un error al cambiar la contraseña del usuario',
              life: 3000,
            });
            this.visible=false
          },
        });
    } else {
      this.reestablecerPasswordForm.markAllAsTouched();
    }
  }

  desactivarUsuario(status: boolean) {
    this.usuariosService
      .actualizarEstadoUsuario(this.usuarioSeleccionado.idUsuario, status)
      .subscribe({
        next: (resp) => {
          let nuevoEstado = status ? 'ACTIVO' : 'INACTIVO';
          this.usuarioSeleccionado.estado = nuevoEstado;
          this.listadoUsuarios.filter((lu) => lu.idUsuario != this.usuarioSeleccionado.idUsuario);
          this.listadoUsuarios.push(this.usuarioSeleccionado);
          this.messageService.add({
            severity: 'success',
            summary: 'cambio de estado exitoso',
            detail: 'Se cambio corrrectamente el estado del usuario',
            life: 3000,
          });
          this.cd.detectChanges();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrio un error al cambiar el estado del usuario',
            life: 3000,
          });
        },
      });
  }

  isInvalid(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
