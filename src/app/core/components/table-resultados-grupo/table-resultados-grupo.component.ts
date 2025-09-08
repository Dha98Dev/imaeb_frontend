import { Component, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-table-resultados-grupo',
  standalone: false,
  templateUrl: './table-resultados-grupo.component.html',
  styleUrl: './table-resultados-grupo.component.scss'
})
export class TableResultadosGrupoComponent {
  // constructor(private confirmationService: ConfirmationService, private messageService: MessageService) { }
  public encabezados: string[] = []
  public alumnos: any[] = [];
  public alumnoSeleccionado:string=''
  ngOnInit() {
    this.encabezados.push('APELLIDO_P', 'APELLIDO_M', 'NOMBRE', 'SEXO')

    let lenguajes: string[] = []
    let mat: string[] = []
    let ciencias: string[] = []

    for (let i = 1; i < 41; i++) {
      lenguajes.push('L' + i)
      mat.push('M' + i)
      ciencias.push('C' + i)
    }
    this.encabezados = [...this.encabezados, ...lenguajes, ...mat, ...ciencias, 'Alumno', 'Estatal']

    this.generarDatosPrueba(25)
    console.log(this.alumnos[0])
  }

  generarDatosPrueba(total: number) {
    const nombres = ['Juan', 'María', 'Pedro', 'Lucía', 'Miguel', 'Sofía'];
    const apellidos = ['López', 'Martínez', 'Hernández', 'Gómez', 'Ramírez'];

    for (let i = 0; i < total; i++) {
      const alumno: any = {};

      alumno['APELLIDO_P'] = apellidos[Math.floor(Math.random() * apellidos.length)];
      alumno['APELLIDO_M'] = apellidos[Math.floor(Math.random() * apellidos.length)];
      alumno['NOMBRE'] = nombres[Math.floor(Math.random() * nombres.length)];
      alumno['SEXO'] = Math.random() > 0.5 ? 'H' : 'M';
      alumno['Alumno'] = `Alumno_${i + 1}`;
      alumno['Estatal'] = Math.random() > 0.5 ? 'Sí' : 'No';

      // Materias con 0 o 1
      this.encabezados.forEach((campo) => {
        if (campo.startsWith('L') || campo.startsWith('M') || campo.startsWith('C')) {
          alumno[campo] = Math.random() > 0.5 ? 1 : 0;
        }
      });


      this.alumnos.push(alumno);
    }

  }

  detallesAlumno() {
    alert('redireccionando a los detalles del alumno')
  }

  //  confirm1(event: Event) {
  //       this.confirmationService.confirm({
  //           target: event.target as EventTarget,
  //           message: 'Quiere ver los detalles de ' + this.alumnoSeleccionado,
  //           header: 'Confirmar',
  //           closable: true,
  //           closeOnEscape: true,
  //           icon: 'pi pi-exclamation-triangle',
  //           rejectButtonProps: {
  //               label: 'Cancel',
  //               severity: 'secondary',
  //               outlined: true,
  //           },
  //           acceptButtonProps: {
  //               label: 'Save',
  //           },
  //           accept: () => {
  //               this.messageService.add({ severity: 'info', summary: 'Consultando informacion', detail: 'En breve podrá observar los resultados', life:500 });
  //               setTimeout(() => {
  //                 this.detallesAlumno()
  //               }, 700);
  //           },
  //           reject: () => {
  //               this.messageService.add({
  //                   severity: 'error',
  //                   summary: 'Rejected',
  //                   detail: 'You have rejected',
  //                   life:500,
  //               });
  //           },
  //       });
  //   }

}