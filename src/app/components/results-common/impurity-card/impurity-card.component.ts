import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
export class ImpurityCardComponent implements OnInit, OnDestroy {

  private static apiCallCount: number = 0; // ✅ Global static counter
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
      ImpurityCardComponent.apiCallCount++; // ✅ Increment static counter
      this.apiCallInstance = ImpurityCardComponent.apiCallCount; // ✅ Assign instance count
      console.log(`API data received ${this.apiCallInstance} times`);

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

  constructor(private dialog: MatDialog, private utilityService: UtilityService) { }

  ngOnInit() {
      console.log("-----------------", this._data)
    // ✅ Reset static counter when the component loads initially
    if (ImpurityCardComponent.apiCallCount === 0) {
      ImpurityCardComponent.apiCallCount = 0;
    }
  }

  ngOnDestroy() {
    // ✅ Reset counter when navigating away from the component
    ImpurityCardComponent.apiCallCount = 0;
  }

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

  getImageUrl(data: any): string {
    return (
      environment.baseUrl +
      environment.domainNameChemicalDirectoryStructure +
      this.data?.chemical_structure
    );
  }
 onImgError(event: Event) {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = 'assets/components/noimg.png';
}
  openImageModal(imageUrl: string): void {
    this.dialog.open(ImageModalComponent, {
      width: 'calc(100vw - 5vw)',
      height: '700px',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}
