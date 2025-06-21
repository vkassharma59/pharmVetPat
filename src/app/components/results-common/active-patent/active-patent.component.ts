import {
   Component,
   EventEmitter,
   Input,
   Output,
   OnChanges
 } from '@angular/core';
 import { UtilityService } from '../../../services/utility-service/utility.service';
 import { CommonModule } from '@angular/common';
 import { MainSearchService } from '../../../services/main-search/main-search.service';
 import { ChildPagningTableComponent } from '../../../commons/child-pagning-table/child-pagning-table.component';
import { ActivePatentCardComponent } from "../active-patent-card/active-patent-card.component";
import { LoadingService } from '../../../services/loading-service/loading.service';
 
 @Component({
   selector: 'chem-active-patent',
  standalone: true,
  imports: [ChildPagningTableComponent, CommonModule, ActivePatentCardComponent],
  templateUrl: './active-patent.component.html',
  styleUrl: './active-patent.component.css'
 })
 export class ActivePatentComponent implements OnChanges {

   _data: any = { columns: [], rows: [] }; // expected structure
   _currentChildAPIBody: any;
   searchByTable: boolean = false;
   isFilterApplied: boolean = false; // agar filter lagana hai to true karenge
   count: number = 0;
   totalPages: number = 0;
 
   get pageSize(): number {
     return this._currentChildAPIBody?.length || 25;
   }
   @Output() handleResultTabData = new EventEmitter<any>();
   @Output() handleSetLoading = new EventEmitter<boolean>();
 
   @Input()
   set data(value: any) {
     this._data = value;
     this.handleResultTabData.emit(this._data?.rows || []);
   }
 
   get data() {
     return this._data;
   }
 
   @Input()
   get currentChildAPIBody() {
     return this._currentChildAPIBody;
   }
   set currentChildAPIBody(value: any) {
     this._currentChildAPIBody = value;
   }
   @Input() index: any;
   @Input() tabName?: string;
   resultTabs: any = {};
   constructor(private utilityService: UtilityService,
     private mainSearchService: MainSearchService,
     public loadingService: LoadingService
   ) {
     this.resultTabs = this.utilityService.getAllTabsName();
   }
 
   ngOnChanges() {
     this.handleResultTabData.emit(this._data);
   }
 
   onDataFetchRequest(payload: any) {
     this.isFilterApplied = !!(payload?.search || payload?.columns);
   
     // Remove stale filters from _currentChildAPIBody if they are not in payload
     if (!('columns' in payload)) {
       delete this._currentChildAPIBody.columns;
     }
 
     if (!('search' in payload)) {
       delete this._currentChildAPIBody.search;
     }
     const requestBody = {
       ...this._currentChildAPIBody,
       ...payload
     };
    this._currentChildAPIBody = requestBody;
     this.handleSetLoading.emit(true);
 
     this.mainSearchService.activePatentSearchSpecific(requestBody).subscribe({
       next: (result: any) => {
         this._data.rows = result?.data?.data || [];
         this.count = result?.data?.recordsFiltered ?? result?.data?.recordsTotal;
         this.totalPages = Math.ceil(this.count / this.pageSize);
         this._currentChildAPIBody.count = this.count;
         this.searchByTable = true;
         this.handleResultTabData.emit(this._data.rows);
         this.handleSetLoading.emit(false);
       },
       error: (err) => {
         console.error('API Error:', err);
         this.handleSetLoading.emit(false);
       },
       complete: () => {
         this.handleSetLoading.emit(false);
       }
     });
   }
 
 
 
 }