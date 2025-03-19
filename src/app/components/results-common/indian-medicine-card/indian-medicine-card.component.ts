import { Component, Input } from '@angular/core';
import { Auth_operations } from '../../../Utils/SetToken';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-indian-medicine-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indian-medicine-card.component.html',
  styleUrl: './indian-medicine-card.component.css'
})
export class IndianMedicineCardComponent {

  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  indian_medicine_column: any = {};
  resultTabs: any = {};

  static apiCallCount: number = 0; // Global static counter

  localCount: number = 0; // Stores the instance-specific count

  @Input()
  get data() {  
    return this._data;  
  }
  set data(value: any) {    
    if (value && Object.keys(value).length > 0) {
      IndianMedicineCardComponent.apiCallCount++; // Increment the static counter
      this.localCount = IndianMedicineCardComponent.apiCallCount; // Assign to local instance
     
      console.log(`API data received ${this.localCount} times`);

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.indianMedicine?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.indianMedicine.name].length; i++) {
          this.indian_medicine_column[column_list[this.resultTabs.indianMedicine.name][i].value] =
            column_list[this.resultTabs.indianMedicine.name][i].name;
        }
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {}

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  
  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.indian_medicine_column[value];
  }

  getPubchemId(value: any) {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
  }

  getCompanyWebsite(value: any) {
    return `https://${value}`;
  }

  handleCopy(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.select();
    textArea.setSelectionRange(0, 99999);
    document.execCommand('copy');

    document.body.removeChild(textArea);
    alert('Item Copied!');
  }

  getImageUrl(data: any): string {
    return (
      environment.baseUrlProduct +
      environment.productImages +
      this._data?.product_image1
    );
  }
}
