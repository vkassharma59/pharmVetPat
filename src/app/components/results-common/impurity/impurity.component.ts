import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'chem-impurity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './impurity.component.html',
  styleUrl: './impurity.component.css'
})
export class ImpurityComponent {

  isDropdownVisible: boolean = false;
  isDropdownVisible2: boolean = false;

  toggleDropdown()
   {
    this.isDropdownVisible = !this.isDropdownVisible;
  }
  toggleDropdown2()
  {
   this.isDropdownVisible2 = !this.isDropdownVisible2;
 }

}
  