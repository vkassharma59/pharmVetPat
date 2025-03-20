import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Auth_operations } from '../../../Utils/SetToken';
import { UtilityService } from '../../../services/utility-service/utility.service';

@Component({
  selector: 'chemical-directory-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chemical-directory-data-card.component.html',
  styleUrl: './chemical-directory-data-card.component.css',
})
export class ChemicalDirectoryDataCardComponent {

  private static counter = 0; // Persistent counter across instances
  MoreInfo: boolean = false;
  MoreApplicationInfo: boolean = false;
  _data: any = [];
  searchType: string = 'trrn';
  keyword: string = '';
  pageNo: number = 1;
  localCount: number;
  
  chem_column: any = {};
  resultTabs: any = {};

  @Input() CurrentAPIBody: any;
  @Output() ROSChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {
    this.localCount = ++ChemicalDirectoryDataCardComponent.counter; // Assign unique count to each instance
  }

  @Input() 
  get data() {  
    return this._data;  
  }
  set data(value) {    
    this.resultTabs = this.utilityService.getAllTabsName();
    const column_list = Auth_operations.getColumnList();
    if (column_list[this.resultTabs.chemicalDirectory?.name]?.length > 0 && Object.keys(value).length > 0 && value) {
      for (let i = 0; i < column_list[this.resultTabs.chemicalDirectory.name].length; i++) {
        this.chem_column[column_list[this.resultTabs.chemicalDirectory.name][i].value] =
          column_list[this.resultTabs.chemicalDirectory.name][i].name;
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

  handleCopy(text: any) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Item Copied!');
  }

  handleROSButtonClick(value: any) {
    this.ROSChange.emit(value === 'ros_search' ? 'ROS_search' : 'ROS_filter');
  }

  getPatentUrl(data: any) {
    return `https://patentscope.wipo.int/search/en/result.jsf?inchikey=${data?.inchikey}`;
  }

  getImageUrl = () => {
    return `${environment.baseUrl}${environment.domainNameChemicalDirectoryStructure}${this.data?.chemical_structure}`;
  };

  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getPubchemId(value: any) {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
  }

  isDateTimeString(dateString: any) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  getUpdationDate(data: any) {
    if (this.isDateTimeString(data)) {
      return new Date(data).toISOString().split('T')[0]; // Extract yyyy-mm-dd format
    }
    return data;
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
