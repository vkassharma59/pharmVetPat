import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  ViewChildren,
  QueryList,
  ElementRef,
  HostListener
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { ScientificDocsCardComponent } from '../scientific-docs-card/scientific-docs-card.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { Auth_operations } from '../../../Utils/SetToken';
@Component({
 
  selector: 'app-scientific-docs',
  standalone: true,
  imports: [ChildPagingComponent, CommonModule, ScientificDocsCardComponent],
  templateUrl: './scientific-docs.component.html',
  styleUrls: ['./scientific-docs.component.css']
})
export class ScientificDocsComponent  {
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
 @Input() currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  @Input() index: any;
  @Input() tabName?: string;
  _data: any = [];
  @Input()
  get data() {
       return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
 
  constructor(
    private utilityService: UtilityService,
    public loadingService: LoadingService,
    private mainSearchService: MainSearchService,
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  ngOnChanges() {
      console.log('JapanComponent received data:', this._data);
    }
  }