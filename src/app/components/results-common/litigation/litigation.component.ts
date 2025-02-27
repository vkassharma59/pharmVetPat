import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'chem-litigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './litigation.component.html',
  styleUrl: './litigation.component.css'
})
export class LitigationComponent {
  isDropdownVisible2:boolean=false;
  isDropdownVisible3:boolean=false;


  toggleDropdown2()
  {
    this.isDropdownVisible2=!this.isDropdownVisible2;
  }
  toggleDropdown3()
  {
    this.isDropdownVisible3=!this.isDropdownVisible3;
  }




}
