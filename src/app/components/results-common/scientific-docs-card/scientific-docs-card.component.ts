import { Component, Input, OnChanges, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ViewChildren, ElementRef, QueryList } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import * as ExcelJS from 'exceljs';
import { UserPriviledgeService } from '../../../services/user_priviledges/user-priviledge.service';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
@Component({
  selector: 'app-scientific-docs-card',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule],
  templateUrl: './scientific-docs-card.component.html',
  styleUrl: './scientific-docs-card.component.css'
})

export class ScientificDocsCardComponent implements OnChanges {

  _data: any = [];
  noMatchingData: boolean = false;
  MoreInfo: boolean = false;
  pageNo: number = 1;
  scientific_column: Record<string, string> = {};
  resultTabs: any = {};
  columns: any[] = [];
  scientificApiBody: any;
  _currentChildAPIBody: any;
  filteredCountries: any[] = [];
  @Input() countryConfig: any[] = [];
  static apiCallCount: number = 0;
  localCount: number = 0;

  constructor(private dialog: MatDialog,
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,

  ) {

  }
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  routesList = {
    countries: [
      { key: 'USA', total: 78 },
      { key: 'Europe', total: 45 },
      { key: 'Japan', total: 3 },

    ]
  };
  @Input() selectedCountry: any;
  @Input()
  get data() {
    console.log("helo",this._data);
    return this._data;
  }

  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      // this.noMatchingData = false;
      ScientificDocsCardComponent.apiCallCount++;
      this.localCount = ScientificDocsCardComponent.apiCallCount;
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.scientific?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.scientific.name].length; i++) {
          const col = column_list[this.resultTabs.scientific.name][i];
          this.scientific_column[col.value] = col.name;
        }
      }
      this._data = value;
      
    }
  }
  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
   }

  @Input() countryList: any[] = []; // ← This replaces processCountryData

  ngOnInit() {
    //this.processCountryData();
    if (ScientificDocsCardComponent.apiCallCount === 0) {
      ScientificDocsCardComponent.apiCallCount = 0;
    }
  }

  getscientificPrefix(country: string): string {
    const upperKey = (country || '').toUpperCase();
    const prefixMap: { [key: string]: string } = {
      'USA': 'USscientific',
      'EUROPE': 'EPscientific',
      'JAPAN': 'Jscientific',
      'KOREA': 'Kscientific',
      'BRAZIL': 'Bscientific'
    };
    return prefixMap[upperKey] || 'scientific';
  }

  ngOnDestroy() {
    ScientificDocsCardComponent.apiCallCount = 0;
  }


  toggleMoreInfo(): void {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any): string {
    const name = this.scientific_column[value] || value;
    return name;
  }


  handleCopy(text: string, event: MouseEvent) {

    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.select();
    textArea.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(textArea);

    // Get the clicked element from event
    const target = event.currentTarget as HTMLElement;
    const icon = target.querySelector('i');

    if (icon?.classList.contains('fa-copy')) {
      icon.classList.remove('fa-copy');
      icon.classList.add('fa-check');
      setTimeout(() => {
        icon.classList.remove('fa-check');
        icon.classList.add('fa-copy');
      }, 1500);
    }
  }
  copyText(elementId: string, event: Event) {
    const el = event.currentTarget as HTMLElement;
    const textToCopy = document.getElementById(elementId)?.innerText;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (el.classList.contains('fa-copy')) {
          el.classList.remove('fa-copy');
          el.classList.add('fa-check');
          setTimeout(() => {
            el.classList.remove('fa-check');
            el.classList.add('fa-copy');
          }, 1500);
        }
      }).catch(err => {
        console.error('[scientificCardComponent] ❌ Failed to copy text:', err);
      });
    }
  }
}