import { Component, Input, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { DataGraficaBarra } from '../../Interfaces/grafica.interface';

@Component({
  selector: 'app-chart-barra',
  standalone: false,
  templateUrl: './chart-barra.component.html',
  styleUrl: './chart-barra.component.scss'
})
export class ChartBarraComponent {
  @Input() public dataChart: DataGraficaBarra = {} as DataGraficaBarra;
  @Input() randomColors: boolean = false;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {} as Highcharts.Options;

  inicializarGrafica(): void {
    const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const firstColor = this.randomColors ? getRandomColor() : '#68AD68';
    const secondColor = this.randomColors ? getRandomColor() : '#D12A56';

    const series: Highcharts.SeriesOptionsType[] = [{
      type: 'column',
      name: this.dataChart.firstLeyend || 'Resultado',
      data: this.dataChart.firstDataSet ?? [],
      color: firstColor
    }];

    if (this.dataChart.secondLeyend && this.dataChart.secondDataSet?.length) {
      series.push({
        type: 'column',
        name: this.dataChart.secondLeyend,
        data: this.dataChart.secondDataSet,
        color: secondColor
      });
    }

    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        plotBackgroundColor: 'transparent',
        plotBorderWidth: 0
      },
      title: { text: '' },
      subtitle: { text: '' },
      xAxis: {
        categories: this.dataChart.categorias ?? [],
        crosshair: { width: 1 },
        gridLineWidth: 0,
        accessibility: { description: this.dataChart.description },
        labels: { style: { fontSize: '11px' } }
      },
      yAxis: {
        min: 0,
        gridLineWidth: 1,
        title: { text: this.dataChart.title },
        labels: { style: { fontSize: '11px' } }
      },
      tooltip: {
        valueSuffix: '%',
        borderWidth: 1,
        borderRadius: 8,
        shadow: false
      },
      legend: { enabled: true },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
            maxPointWidth: 120,
          dataLabels: {
            enabled: true,
            format: '{y}%',
            style: { fontSize: '11px', fontWeight: 'bold', textOutline: 'none' }
          }
        }
      },
      series,
      credits: { enabled: false }
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataChart'] && changes['dataChart'].currentValue) this.inicializarGrafica();
  }
}