import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'chem-spcdb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spcdb.component.html',
  styleUrl: './spcdb.component.css'
})
export class SpcdbComponent {
  isPopupOpen= false;

  openPopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }  

  // =====================================
  isPopupOpen2= false;

  openPopup2() {
    this.isPopupOpen2 = true;
  }

  closePopup2() {
    this.isPopupOpen2 = false;
  }  


}
