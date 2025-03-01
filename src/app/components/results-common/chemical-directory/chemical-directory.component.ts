import { Component, Input } from '@angular/core';
import { ChemicalDirectoryDataCardComponent } from '../chemical-directory-card/chemical-directory-data-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chemical-directory',
  standalone: true,
  imports: [ChemicalDirectoryDataCardComponent, CommonModule],
  templateUrl: './chemical-directory.component.html',
  styleUrl: './chemical-directory.component.css'
})
export class ChemicalDirectoryComponent {

    _data: any = [];
    @Input()
    get data() {
      return this._data;
    }
    set data(value: any) {
      this._data = value;
    }
}
