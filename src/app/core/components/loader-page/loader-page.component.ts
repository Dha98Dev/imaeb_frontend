import { Component, Input } from '@angular/core';

export type VarianteLoader = 'guinda' | 'esmeralda' | 'violeta' | 'grafito';

@Component({
  selector: 'app-loader-page',
  standalone: false,
  templateUrl: './loader-page.component.html',
  styleUrl: './loader-page.component.scss',
})
export class LoaderPageComponent {
  @Input() variante: VarianteLoader = 'guinda';
  @Input() titulo: string = 'Preparando tu información';

  public readonly duracionMensaje: number = 3;

public readonly mensajes: string[] = [
  'Consultando información...',
  'Organizando la información...',
  'Realizando cálculos...',
  'Preparando tus resultados...',
  'Generando la vista...',
  'Casi terminamos...',
];
}