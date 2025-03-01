import { Component, Input } from '@angular/core';
import { ChemiTrackerCardComponent } from '../chemi-tracker-card/chemi-tracker-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chem-chemi-tracker',
  standalone: true,
  imports: [ChemiTrackerCardComponent, CommonModule],
  templateUrl: './chemi-tracker.component.html',
  styleUrl: './chemi-tracker.component.css'
})
export class ChemiTrackerComponent {

    _data: any = [];
    @Input()
    get data() {
      return this._data;
    }
    set data(value: any) {
      this._data = value;
    }
}
