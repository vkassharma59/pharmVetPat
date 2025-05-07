import { Component } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ScientificDocsCardComponent } from '../scientific-docs-card/scientific-docs-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component'; 

@Component({
  selector: 'app-scientific-docs',
  standalone: true,
  imports: [ChildPagingComponent,CommonModule,ScientificDocsCardComponent],
  templateUrl: './scientific-docs.component.html',
  styleUrl: './scientific-docs.component.css'
})
export class ScientificDocsComponent {


  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;
  
  resultTabs: any = {};
  _data: any = [];
  value:string []=['hwlllo ','byeeee','ghr jao']
  @Input()
  get data() {
    console.log(this.data);
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
  
  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }
  ngOnChanges() {
   console.log('scientificDocs received data:', this._data);
 } 
}
