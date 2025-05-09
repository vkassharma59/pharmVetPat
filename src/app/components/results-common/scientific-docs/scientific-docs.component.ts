import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component'; 
import { ScientificDocsCardComponent } from '../scientific-docs-card/scientific-docs-card.component';
@Component({
  selector: 'app-scientific-docs',
  standalone: true,
  imports: [ChildPagingComponent, CommonModule,ScientificDocsCardComponent],
  templateUrl: './scientific-docs.component.html',
  styleUrls: ['./scientific-docs.component.css']
})
export class ScientificDocsComponent implements OnChanges {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;
  
  resultTabs: any = {};
  _data: any = [];
  
  @Input()
  get data() {
    return this._data;
  }

  set data(value: any) {
    this._data = value;
    // Emit the data when it is set
    this.handleResultTabData.emit(this._data);
  }

  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  ngOnChanges() {
    console.log('scientificDocs received data:--------------------', this._data);
  }
}
