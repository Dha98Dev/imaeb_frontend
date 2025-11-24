import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-chart-pastel',
  standalone: false,
  templateUrl: './chart-pastel.component.html',
  styleUrl: './chart-pastel.component.scss'
})
export class ChartPastelComponent {
@Input() public title:string='Porcentaje de resultados'

Highcharts: typeof Highcharts = Highcharts; // Necesario para el wrapper
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      plotShadow: false
    },
    title: {
      text: this.title
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    },
    series: [{
      type: 'pie',
      name: 'Brands',
      colorByPoint: true,
      data: [
        { name: 'Chrome', y: 74.77, sliced: true, selected: true },
        { name: 'Edge', y: 12.82 },
        { name: 'Firefox', y: 4.63 },
        { name: 'Safari', y: 2.44 },
        { name: 'Internet Explorer', y: 2.02 },
        { name: 'Other', y: 3.28 }
      ]
    } as Highcharts.SeriesPieOptions]
  };
}
