import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ImpurityCardComponent } from '../impurity-card/impurity-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';

@Component({
  selector: 'chem-impurity',
  standalone: true,
  imports: [CommonModule, ImpurityCardComponent],
  templateUrl: './impurity.component.html',
  styleUrl: './impurity.component.css'
})
export class ImpurityComponent {

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
