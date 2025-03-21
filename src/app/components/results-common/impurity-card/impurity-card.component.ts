import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chem-impurity-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './impurity-card.component.html',
  styleUrl: './impurity-card.component.css'
})
export class ImpurityCardComponent {
  
  private static apiCallCount: number = 0; // ✅ STATIC COUNTER
  _data: any = [];
  MoreInfo: boolean = false;
  searchType: string = 'trrn';
  keyword: string = '';
  pageNo: number = 1;

  impurity_column: any = {};
  resultTabs: any = {};

  apiCallInstance: number = 0; // ✅ Instance-specific count

  @Input()
  get data() {  
    return this._data;  
  }
  set data(value) {    
    if (value && Object.keys(value).length > 0) {
      ImpurityCardComponent.apiCallCount++; // ✅ STATIC COUNTER
      this.apiCallInstance = ImpurityCardComponent.apiCallCount; // ✅ Instance-specific count
      console.log(`Total API Calls: ${ImpurityCardComponent.apiCallCount}`);

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();
      
      if (column_list[this.resultTabs.impurity?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.impurity.name].length; i++) {
          this.impurity_column[column_list[this.resultTabs.impurity.name][i].value] =
            column_list[this.resultTabs.impurity.name][i].name;
        }
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog,
      private utilityService: UtilityService) {}
  
  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.impurity_column[value];
  }

  getPubchemId(value: any) {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
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

  getImageUrl = (data: any) => {
    return (
      environment.baseUrl +
      environment.domainNameChemicalDirectoryStructure +
      this.data?.chemical_structure
    );
  };

  openImageModal(imageUrl: string): void {
    this.dialog.open(ImageModalComponent, {
      width: 'calc(100vw - 5vw)',
      height: '700px',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}
