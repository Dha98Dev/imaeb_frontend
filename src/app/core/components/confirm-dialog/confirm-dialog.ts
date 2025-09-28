import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {
 @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Input() confirmLeyend: string = 'Confirmar';
  @Input() cancelLeyend: string = 'Cancelar';
  @Input() mensaje: string = '';
  
  public visible = false;
  public isClosing = false;
  // public mensaje:string=''
// En el componente TypeScript
private animationTimeout: any;

open(mensaje:string) {
  this.visible = true;
  this.mensaje=mensaje
}

emitSeleccion(action: 'confirm' | 'cancel') {
  console.log(action);
  
  if (action === 'confirm') {
    this.confirm.emit();
  } else {
    this.cancel.emit();
  }
  
  this.close();
}

close() {
  console.log('cerrando modal');

    this.visible = false;

}
}
