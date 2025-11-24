import { Component, Input } from '@angular/core';
import { breadCrumb } from '../../Interfaces/BreadCrum.interface';

@Component({
  selector: 'app-bread-crumb',
  standalone: false,
  templateUrl: './bread-crumb.component.html',
  styleUrl: './bread-crumb.component.scss'
})
export class BreadCrumbComponent {

@Input()
public breadCrumb:breadCrumb[]=[]
}
