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
  public dataChart: DataGraficaBarra = {} as DataGraficaBarra;

  @Input() randomColors: boolean = false;
  @Input() colorBarras: string = '';

  Highcharts: typeof Highcharts = Highcharts;

  chartOptions: Highcharts.Options = {} as Highcharts.Options;

  inicializarGrafica(): void {

    const getRandomColor = () =>
      '#' + Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');

    let firstColor: string;

    firstColor = this.randomColors
      ? getRandomColor()
      : '#68AD68';

    if (!this.randomColors && this.colorBarras != '') {
      firstColor = this.colorBarras;
    }

    this.chartOptions = {

      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        plotBackgroundColor: 'transparent',
        plotBorderWidth: 0
      },

      title: {
        text: ''
      },

      subtitle: {
        text: ''
      },

      xAxis: {
        categories: this.dataChart.categorias,

        crosshair: {
          width: 1
        },

        gridLineWidth: 0,

        accessibility: {
          description: this.dataChart.description
        },

        labels: {
          style: {
            fontSize: '11px'
          }
        }
      },

      yAxis: {
        min: 0,

        gridLineWidth: 1,

        title: {
          text: this.dataChart.title
        },

        labels: {
          style: {
            fontSize: '11px'
          }
        }
      },

      tooltip: {
        valueSuffix: '',
        borderWidth: 1,
        borderRadius: 8,
        shadow: false
      },

      legend: {
        enabled: true
      },

      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,

          dataLabels: {
            enabled: true,
            format: '{y}',

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
      ],

      credits: {
        enabled: false
      }

    };

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['dataChart'] &&
      changes['dataChart'].currentValue
    ) {
      this.inicializarGrafica();
    }

  }

}