import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { Auth_operations } from '../../../Utils/SetToken';
import { UtilityService } from '../../../services/utility-service/utility.service';

@Component({
  selector: 'chemical-directory-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chemical-directory-data-card.component.html',
  styleUrl: './chemical-directory-data-card.component.css',
})
export class ChemicalDirectoryDataCardComponent implements OnInit, OnDestroy {
  
  private static counter = 0; // ✅ Global counter across instances
  _data: any = [];
  chem_column: any = {};
  resultTabs: any = {};
  
  MoreInfo: boolean = false;
  MoreApplicationInfo: boolean = false;
  searchType: string = 'trrn';
  keyword: string = '';
  pageNo: number = 1;
  localCount: number; // ✅ Instance-specific counter

  @Input() CurrentAPIBody: any;
  @Output() ROSChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {
    this.localCount = ++ChemicalDirectoryDataCardComponent.counter; // ✅ Assign unique count to each instance
    console.log(`Instance Created: ${this.localCount}, Total Count: ${ChemicalDirectoryDataCardComponent.counter}`);
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

  handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => alert('Item Copied!'));
  }

  handleROSButtonClick(value: string) {
    this.ROSChange.emit(value === 'ros_search' ? 'ROS_search' : 'ROS_filter');
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
