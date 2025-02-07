import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'chem-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './us.component.html',
  styleUrl: './us.component.css'
})
export class UsComponent {

  isPopupOpen = false;

  openPopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }

  // =========================
  isPopupOpen2 = false;

  openPopup2() {
    this.isPopupOpen2 = true;
  }

  closePopup2() {
    this.isPopupOpen2 = false;
  }
// ============================
  isPopupOpen3 = false;

  openPopup3() {
    this.isPopupOpen3 = true;
  }

  closePopup3() {
    this.isPopupOpen3 = false;
  }

  // ==============================

  isPopupOpen4 = false;

  openPopup4() {
    this.isPopupOpen4 = true;
  }

  closePopup4() {
    this.isPopupOpen4 = false;
  }

  // ==================================

  isPopupOpen5 = false;

  openPopup5() {
    this.isPopupOpen5 = true;
  }

  closePopup5() {
    this.isPopupOpen5 = false;
  }

  // ==================================

  isPopupOpen6 = false;

  openPopup6() {
    this.isPopupOpen6 = true;
  }

  closePopup6() {
    this.isPopupOpen5 = false;
  }

   // ==================================

   isPopupOpen7 = false;

   openPopup7() {
     this.isPopupOpen7 = true;
   }
 
   closePopup7() {
     this.isPopupOpen7 = false;
   }

}
