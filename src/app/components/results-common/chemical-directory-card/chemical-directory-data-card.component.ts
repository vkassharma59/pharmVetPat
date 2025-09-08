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
import { SharedRosService } from '../../../shared-ros.service';

@Component({
  selector: 'chemical-directory-card',
  standalone: true,
  imports: [CommonModule,],
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
  _currentChildAPIBody: any;
  searchThrough: string = '';
  @Input() CurrentAPIBody: any;
  @Input() index: any;
  @Output() ROSChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLoadingState: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() activeTabChange: EventEmitter<string> = new EventEmitter<string>();
  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
  }
  constructor(private dialog: MatDialog, private utilityService: UtilityService,
    private columnListService: ColumnListService,
    private mainSearchService: MainSearchService,
    private apiConfigService: ApiConfigService,
    private sharedROS: SharedRosService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.localCount = ++ChemicalDirectoryDataCardComponent.counter; // ✅ Assign unique count to each instance
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
    this.showAppIntermediates = (this.searchThrough === searchTypes.chemicalStructure);
  }

  ngOnInit() {
    console.log("searchThrough", this.searchThrough)
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
        for (let i = 0; i < column_list[this.resultTabs.chemicalDirectory.name].length; i++) {
          this.chem_column[column_list[this.resultTabs.chemicalDirectory.name][i].value] =
            column_list[this.resultTabs.chemicalDirectory.name][i].name;
        }
      }
      this._data = value;
    }
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  getColumnName(value: any) {
    return this.chem_column[value];
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
  handleROSButtonClick(value: any) {
    // Always emit - even if value is same as last time
    if (value === 'ros_search') {
      this.ROSChange.emit('ROS_search_' + new Date().getTime());
    } else {
      this.ROSChange.emit('ROS_filter_' + new Date().getTime());
    }

    this.sharedROS.setROSCount({
      agrochemical: this._data?.special_count?.agroTotal ?? 0,
      pharmaceutical: this._data?.special_count?.pharmaTotal ?? 0,
      index: this.index
    });

    if (this.resultTabs?.technicalRoutes?.name) {
      console.log("📤 Emitting tab change to:", this.resultTabs.technicalRoutes.name);
      this.utilityService.setActiveTab(this.resultTabs.technicalRoutes.name);
      this.activeTabChange.emit(this.resultTabs.technicalRoutes.name);
    }
  }

  getPatentUrl(data: any) {
    return `https://patentscope.wipo.int/search/en/result.jsf?inchikey=${data?.inchikey}`;
  }

  getImageUrl(): string {
    return `${environment.baseUrl}${environment.domainNameChemicalDirectoryStructure}${this._data?.chemical_structure}`;
  }
  showFull = false;
  toggleView() {
    this.showFull = !this.showFull;
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

  openImageModal(imageUrl: string, showZoomControls: boolean): void {
    this.dialog.open(ImageModalComponent, {
      width: 'auto',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: {
        dataImage: imageUrl,
        showZoomControls: showZoomControls
      },
    });
  }
  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    element.src = '/assets/no-image.jpg'; // Fallback image path
  }
}