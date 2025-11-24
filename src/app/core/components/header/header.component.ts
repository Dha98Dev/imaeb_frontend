import { Component } from '@angular/core';
import { BreadCrumService } from '../../services/breadCrumbs/bread-crumb-service';
import { breadCrumb } from '../../Interfaces/BreadCrum.interface';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
constructor(private breadCrumb:BreadCrumService){}
public itemsBread:breadCrumb[]=[]
ngOnInit(){
this.breadCrumb.breadcrumbs$.subscribe(data =>{
  this.itemsBread=data
})
}

}
