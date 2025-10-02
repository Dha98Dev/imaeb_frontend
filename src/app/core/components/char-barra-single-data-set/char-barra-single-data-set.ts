import { Component, Input, SimpleChanges } from '@angular/core';
import { DataGraficaBarra } from '../../Interfaces/grafica.interface';
import * as Highcharts from 'highcharts';
@Component({
  selector: 'app-char-barra-single-data-set',
  standalone: false,
  templateUrl: './char-barra-single-data-set.html',
  styleUrl: './char-barra-single-data-set.scss'
})
export class CharBarraSingleDataSet {

  @Input()
  public dataChart: DataGraficaBarra = {} as DataGraficaBarra

  @Input() randomColors: boolean = false
  @Input() colorBarras: string = ''

  Highcharts: typeof Highcharts = Highcharts; // Importamos la librería
  chartOptions: Highcharts.Options = {} as Highcharts.Options
  inicializarGrafica() {

    // Generador de colores aleatorios en formato hex
    const getRandomColor = () =>
      '#' + Math.floor(Math.random() * 16777215).toString(16);

    let firstColor, secondColor: string
    firstColor = this.randomColors ? getRandomColor() : '#68AD68'
    secondColor = this.randomColors ? getRandomColor() : '#D12A56'

    if (!this.randomColors && this.colorBarras != '' ) {
      firstColor=this.colorBarras
    }

    this.chartOptions = {
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
    valueSuffix: '',
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
      dataLabels: {
        enabled: true,     // 👈 habilita etiquetas
        format: '{y}',    // 👈 el valor mostrado (usa {y} para el dato numérico)
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          textOutline: 'none'
        }
      }
    }
  },
  series: [
    {
      type: 'column',
      name: this.dataChart.firstLeyend,
      data: this.dataChart.firstDataSet,
      color: firstColor
    }
  ]
};

  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['dataChart'] && changes['dataChart'].currentValue)) {
      this.inicializarGrafica()
    }
  }
}
