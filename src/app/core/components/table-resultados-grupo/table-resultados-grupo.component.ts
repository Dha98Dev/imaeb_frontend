import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Subject } from 'rxjs';
import { AlumnoFormateado, Respuesta } from '../../Interfaces/listadoAlumno.interface';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage/sesionStorage.service';

@Component({
  selector: 'app-table-resultados-grupo',
  standalone: false,
  templateUrl: './table-resultados-grupo.component.html',
  styleUrl: './table-resultados-grupo.component.scss'
})
export class TableResultadosGrupoComponent {
  // constructor(private confirmationService: ConfirmationService, private messageService: MessageService) { }
  constructor(private router:Router,  private  storageService:StorageService){}

  public encabezados: string[] = []
  private alumnos: any[] = [];
  public alumnosFiltrados:any[]=[]
  public alumnoSeleccionado: string = ''
  public filtroGlobal:string=''
  @Input()
  public listadoAlumnos:AlumnoFormateado[]=[]
  


  ngOnInit() {
    

    // let lenguajes: string[] = []
    // let mat: string[] = []
    // let ciencias: string[] = []

    // for (let i = 1; i < 41; i++) {
    //   lenguajes.push('L' + i)
    //   mat.push('M' + i)
    //   ciencias.push('C' + i)
    // }
    // this.encabezados = [...this.encabezados, ...lenguajes, ...mat, ...ciencias, 'Alumno', 'Estatal']

    // this.generarDatosPrueba(25)
    // console.log(this.alumnos[0])
  }

  // generarDatosPrueba(total: number) {
  //   const nombres = ['Juan', 'María', 'Pedro', 'Lucía', 'Miguel', 'Sofía'];
  //   const apellidos = ['López', 'Martínez', 'Hernández', 'Gómez', 'Ramírez'];

  //   for (let i = 0; i < total; i++) {
  //     const alumno: any = {};

  //     alumno['APELLIDO_P'] = apellidos[Math.floor(Math.random() * apellidos.length)];
  //     alumno['APELLIDO_M'] = apellidos[Math.floor(Math.random() * apellidos.length)];
  //     alumno['NOMBRE'] = nombres[Math.floor(Math.random() * nombres.length)];
  //     alumno['SEXO'] = Math.random() > 0.5 ? 'H' : 'M';
  //     alumno['Alumno'] = `Alumno_${i + 1}`;
  //     alumno['Estatal'] = Math.random() > 0.5 ? 'Sí' : 'No';

  //     // Materias con 0 o 1
  //     this.encabezados.forEach((campo) => {
  //       if (campo.startsWith('L') || campo.startsWith('M') || campo.startsWith('C')) {
  //         alumno[campo] = Math.random() > 0.5 ? 1 : 0;
  //       }
  //     });


  //     this.alumnos.push(alumno);
  //   }
  //   this.alumnosFiltrados=this.alumnos

  // }
  generarEncabezadostabla(){
    console.log('generando encabezados')
    this.encabezados.push('APELLIDO_P', 'APELLIDO_M', 'NOMBRE', 'SEXO')
    let encabezados=this.listadoAlumnos[0].respuestas
    encabezados.sort((a, b) => a.pregunta - b.pregunta);
    this.listadoAlumnos[0].respuestas.forEach(el=>{
      this.encabezados.push(el.encabezado)
    })
    this.encabezados.push("PROMEDIO")
    this.alumnosFiltrados=this.listadoAlumnos
    console.log(encabezados)
    this.empatarEncabezados()
  }

  empatarEncabezados(){
    console.log(this.alumnosFiltrados)
 this.alumnosFiltrados.forEach(al => {
  al['APELLIDO_P'] = al.apellido_paterno;
  al['APELLIDO_M'] = al.apellido_materno;
  al['NOMBRE'] = al.nombre;
  al['SEXO'] = al.sexo;
  al['PROMEDIO']=al.promedioAlumno

  // Declarar el tipo de res
  al.respuestas.forEach((res: Respuesta) => {
    al[res.encabezado] = res.respuesta;
  });
});
  }

  detallesAlumno() {
    alert('redireccionando a los detalles del alumno')
  }


quitarAcentos(texto: string): string {
  return texto
    .normalize('NFD') // separa letras y tildes
    .replace(/[\u0300-\u036f]/g, '') // elimina las tildes
    .toLowerCase();
}

aplicarFiltrosCombinados() {
  const filtro = this.quitarAcentos(this.filtroGlobal);

  this.alumnosFiltrados = this.listadoAlumnos.filter(al =>
    Object.values(al).some(val =>
      this.quitarAcentos(String(val)).includes(filtro)
    )
  );
}

confirmarVerDetalles(){
  console.log(this.alumnoSeleccionado)
  this.storageService.saveAlumnoSeleccionado(this.alumnoSeleccionado)
  this.router.navigate(['/s/principal_alumno/', this.storageService.getCriptAlSeleccionado()])
}


ngOnChanges(changes: SimpleChanges) {
  if (changes['listadoAlumnos'] && changes['listadoAlumnos'].currentValue ) {
    console.log(this.listadoAlumnos.length)
      if (this.listadoAlumnos.length>0) {
        this.generarEncabezadostabla();
      }

  }
}
}