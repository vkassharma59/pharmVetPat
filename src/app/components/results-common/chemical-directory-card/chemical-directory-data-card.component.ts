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

  MoreInfo: boolean = false;
  MoreApplicationInfo: boolean = false;
  _data: any = {};
  searchType: string = 'trrn'; // Replace with actual search type
  keyword: string = ''; // Initialize as empty string
  pageNo: number = 1;

  chem_column: any = {};
  resultTabs: any = {};

  @Input() CurrentAPIBody: any;
  @Output() ROSChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() 
  get data() {  
    return this._data;  
  }
  set data(value) {    
    this.resultTabs = this.utilityService.getAllTabsName();
    const column_list = Auth_operations.getColumnList();
    if(column_list[this.resultTabs.chemicalDirectory?.name]?.length > 0 && value) {
      for (let i = 0; i < column_list[this.resultTabs.chemicalDirectory.name].length; i++) {
        this.chem_column[column_list[this.resultTabs.chemicalDirectory.name][i].value] =
          column_list[this.resultTabs.chemicalDirectory.name][i].name;
      }

      this._data = value;
    }
  }

  
  constructor(
    private dialog: MatDialog,
    private utilityService: UtilityService
  ) {}

  getColumnName(value: any) {
    return this.chem_column[value];
  }

  handleCopy(text: any) {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    // Select the text
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the textarea
    document.execCommand('copy');

    // Remove the temporary textarea element
    document.body.removeChild(textArea);
    alert('Item Copied!');
  }

  handleROSButtonClick(value: any) {
    if (value === 'ros_search') this.ROSChange.emit('ROS_search');
    else {
      this.ROSChange.emit('ROS_filter');
    }
  }

  getPatentUrl(data: any) {
    return `https://patentscope.wipo.int/search/en/result.jsf?inchikey=${data?.inchikey}`;
  }

  getImageUrl = () => {
    return (
      environment.baseUrl +
      environment.domainNameChemicalDirectoryStructure +
      this.data?.chemical_structure
    );
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
    const isoDate = data;
    if (this.isDateTimeString(isoDate)) {
      const date = new Date(isoDate);

      // Extract the date in yyyy-mm-dd format
      const formattedDate = date.toISOString().split('T')[0];

      return formattedDate;
    } else return data;
  }

  toggleMoreApplicationInfo() {
    this.MoreApplicationInfo = !this.MoreApplicationInfo;
  }

  openImageModal(imageUrl: string): void {
    const dialogRef = this.dialog.open(ImageModalComponent, {
      width: 'auto',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}
