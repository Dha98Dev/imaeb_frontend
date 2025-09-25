import { Component, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { Data } from '@angular/router';
import * as Highcharts from 'highcharts';
import { DataGraficaBarra } from '../../Interfaces/grafica.interface';


@Component({
  selector: 'app-chart-barra',
  standalone: false,
  templateUrl: './chart-barra.component.html',
  styleUrl: './chart-barra.component.scss'
})
export class ChartBarraComponent {
    @Input()
  public dataChart:DataGraficaBarra = {} as DataGraficaBarra
  
  @Input()randomColors:boolean=false

  Highcharts: typeof Highcharts = Highcharts; // Importamos la librería
  chartOptions: Highcharts.Options= {} as  Highcharts.Options  
inicializarGrafica(){

  // Generador de colores aleatorios en formato hex
  const getRandomColor = () =>
    '#' + Math.floor(Math.random() * 16777215).toString(16);

  let firstColor,secondColor:string
    firstColor=this.randomColors ? getRandomColor() : '#68AD68'
    secondColor=this.randomColors ? getRandomColor() : '#D12A56'
  

  this.chartOptions= {
    chart: {
      type: 'column',
    },
    title: {
      text: '',
    },
    subtitle: {
      text: '',
    },
    xAxis: {
      categories: this.dataChart.categorias,
      crosshair: true,
      accessibility: {
        description: this.dataChart.description,
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: this.dataChart.title,
      },
    },
    tooltip: {
      valueSuffix: '%',
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [
      {
        type: 'column',
        name: this.dataChart.firstLeyend,
        data: this.dataChart.firstDataSet,
        color: firstColor
      },
      {
        type: 'column',
        name: this.dataChart.secondLeyend,
        data: this.dataChart.secondDataSet,
        color:secondColor
      },
    ],
  };
}

ngOnChanges(changes: SimpleChanges) {
  if ((changes['dataChart'] && changes['dataChart'].currentValue ) ) {
    this.inicializarGrafica()
    console.log(this.dataChart)
  }
}
}
