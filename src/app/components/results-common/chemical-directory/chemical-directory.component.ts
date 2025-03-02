import { Component, Input } from '@angular/core';
import { ChemicalDirectoryDataCardComponent } from '../chemical-directory-card/chemical-directory-data-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';

@Component({
  selector: 'chemical-directory',
  standalone: true,
  imports: [ChemicalDirectoryDataCardComponent, CommonModule],
  templateUrl: './chemical-directory.component.html',
  styleUrl: './chemical-directory.component.css'
})
export class ChemicalDirectoryComponent {

  resultTabs: any = {};
  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }

  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }
}
