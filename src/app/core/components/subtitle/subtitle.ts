import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-subtitle',
  standalone: false,
  templateUrl: './subtitle.html',
  styleUrl: './subtitle.scss'
})
export class Subtitle {
    constructor(private cd:ChangeDetectorRef){}
@Input() subtitle:string=''

ngOnChanges(changes:SimpleChanges){
if(changes['subtitle'] && changes['subtitle'].currentValue){
}
}
}
