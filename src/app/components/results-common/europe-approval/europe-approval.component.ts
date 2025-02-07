import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'chem-europe-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './europe-approval.component.html',
  styleUrl: './europe-approval.component.css'
})
export class EuropeApprovalComponent {
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


 copyText(elementId: string) {
  const textToCopy = document.getElementById(elementId)?.innerText;

  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert('Text copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
}

}
