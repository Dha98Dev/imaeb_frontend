import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';


@Component({
  selector: 'app-chart-barra',
  standalone: false,
  templateUrl: './chart-barra.component.html',
  styleUrl: './chart-barra.component.scss'
})
export class ChartBarraComponent {
    @Input()
  public dataChart:any

  Highcharts: typeof Highcharts = Highcharts; // Importamos la librería
  chartOptions: Highcharts.Options = {
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
      categories: ['USA', 'China', 'Brazil', 'EU', 'Argentina', 'India'],
      crosshair: true,
      accessibility: {
        description: 'Countries',
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Metrica en Porcentajes ',
      },
    },
    tooltip: {
      valueSuffix: ' (1000 MT)',
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
        name: 'Corn',
        data: [387749, 280000, 129000, 64300, 54000, 34300],
      },
      {
        type: 'column',
        name: 'Wheat',
        data: [45321, 140000, 10000, 140500, 19500, 113500],
      },
    ],
  };
}
