import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { Auth_operations } from '../../../Utils/SetToken';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { searchTypes } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ColumnListService } from '../../../services/columnList/column-list.service';
import { AppConfig } from '../../../commons/models/app-config.interface';
import { AppConfigValues } from '../../../config/app-config';
import { appConfig } from '../../../app.config';
import { ApiConfigService } from '../../../../appservice';
import { TechnicalRoutesCardComponent } from '../technical-routes-card/technical-routes-card.component';
import { TechnicalRoutesComponent } from "../technical-routes/technical-routes.component";
@Component({
  selector: 'chemical-directory-card',
  standalone: true,
  imports: [CommonModule, TechnicalRoutesCardComponent, TechnicalRoutesComponent],
  templateUrl: './chemical-directory-data-card.component.html',
  styleUrl: './chemical-directory-data-card.component.css',
})
export class ChemicalDirectoryDataCardComponent implements OnInit, OnDestroy {

  private static counter = 0; // ✅ Global counter across instances
  _data: any = [];
  chem_column: any = {};
  resultTabs: any = {};
  apiUrls = AppConfigValues.appUrls;
  MoreInfo: boolean = false;
  MoreApplicationInfo: boolean = false;
  searchType: string = 'trrn';
  keyword: string = '';
  pageNo: number = 1;
  localCount: number;
  showAppIntermediates: boolean = false;

  @Input() CurrentAPIBody: any;
  @Output() ROSChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLoadingState: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private dialog: MatDialog, private utilityService: UtilityService,
       private columnListService: ColumnListService,
          private mainSearchService: MainSearchService,
          private apiConfigService: ApiConfigService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.localCount = ++ChemicalDirectoryDataCardComponent.counter; // ✅ Assign unique count to each instance
    const searchThrough = Auth_operations.getActiveformValues().activeForm;
    this.showAppIntermediates = (searchThrough === searchTypes.chemicalStructure);
  }

  ngOnInit() {
    if (ChemicalDirectoryDataCardComponent.counter === 0) {
      ChemicalDirectoryDataCardComponent.counter = 0;
    }
  }

  ngOnDestroy() {
    ChemicalDirectoryDataCardComponent.counter = 0; // ✅ Reset global counter when component is destroyed
  }

  @Input()
  get data() {
    return this._data;
  }
  set data(value) {
    if (value && Object.keys(value).length > 0) {
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.chemicalDirectory?.name]?.length > 0) {
        column_list[this.resultTabs.chemicalDirectory.name].forEach((col: any) => {
          this.chem_column[col.value] = col.name;
        });
      }

      this._data = value;
    }
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  getColumnName(value: any) {
    return this.chem_column[value] || value;
  }

  handleCopy(text: string, el: HTMLElement) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.select();
    textArea.setSelectionRange(0, 99999);
    document.execCommand('copy');

    document.body.removeChild(textArea);

    // Step 2: Find the icon inside the clicked span and swap classes
    const icon = el.querySelector('i');

    if (icon?.classList.contains('fa-copy')) {
      icon.classList.remove('fa-copy');
      icon.classList.add('fa-check');

      // Step 3: Revert it back after 1.5 seconds
      setTimeout(() => {
        icon.classList.remove('fa-check');
        icon.classList.add('fa-copy');
      }, 1500);
    }
  }
  showTechnicalRoute = false;
 handleROSButtonClick(value: any) {
    if (value === 'ros_search') this.ROSChange.emit('ROS_search');
    else {
      this.ROSChange.emit('ROS_filter');
    }
    const tech_API = this.apiConfigService.apiUrls.technicalRoutes.columnList;
    console.log("technicalAPI:",tech_API);

   this.columnListService.getColumnList(tech_API).subscribe({
   
      next: (res) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(
          'technical_route_column_list',
          response
        );
        console.log("responce",response);
      },
      error: (e) => {
        console.error(e);
          this.setLoadingState.emit(false);
      },
    });

  }

  // handleROSButtonClick(value: string) {
  //   this.ROSChange.emit(value === 'ros_search' ? 'ROS_search' : 'ROS_filter');
  // }
//  handleROSButtonClick(value: any) {
//   console.log('📌 handleROSButtonClick triggered with value:', value);

//   if (value === 'ros_search') {
//     console.log('🔁 Emitting: ROS_search');
//     this.ROSChange.emit('ROS_search');
//   } else {
//     console.log('🔁 Emitting: ROS_filter');
//     this.ROSChange.emit('ROS_filter');
//   }

  // ✅ Deactivate all tabs
  Object.keys(this.resultTabs).forEach((key) => {
    this.resultTabs[key].isActive = false;
  });

  // ✅ Activate only Technical Routes tab
  if (this.resultTabs['technicalRoutes']) {
    this.resultTabs['technicalRoutes'].isActive = true;
    console.log('✅ Activated tab: technicalRoutes', this.resultTabs['technicalRoutes']);
  }

  // 🔁 Call the API
  const tech_API = this.apiUrls.technicalRoutes.columnList;
  console.log('🌐 API URL:', tech_API);

  this.setLoadingState.emit(true);

  this.columnListService.getColumnList(tech_API).subscribe({
    next: (res) => {
      console.log('✅ API Success - Response:', res);
      const response = res?.data?.columns || [];

      Auth_operations.setColumnList('technical_route_column_list', response);
      console.log('💾 Saved columns to Auth_operations:', response);

      this.setLoadingState.emit(false);
    },
    error: (e) => {
      console.error('❌ API Error fetching column list:', e);
      this.setLoadingState.emit(false);
    },
  });
}

  getPatentUrl(data: any) {
    return `https://patentscope.wipo.int/search/en/result.jsf?inchikey=${data?.inchikey}`;
  }

  getImageUrl(): string {
    return `${environment.baseUrl}${environment.domainNameChemicalDirectoryStructure}${this._data?.chemical_structure}`;
  }

  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getPubchemId(value: any) {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
  }

  isDateTimeString(dateString: any) {
    return !isNaN(new Date(dateString).getTime());
  }
 

  getUpdationDate(data: any) {
    return this.isDateTimeString(data) ? new Date(data).toISOString().split('T')[0] : data;
  }

  toggleMoreApplicationInfo() {
    this.MoreApplicationInfo = !this.MoreApplicationInfo;
  }

  openImageModal(imageUrl: string): void {
    this.dialog.open(ImageModalComponent, {
      width: 'auto',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}