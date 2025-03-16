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
    this.isPopupOpen6 = false;
  }

   // ==================================

   isPopupOpen7 = false;

   openPopup7() {
     this.isPopupOpen7 = true;
   }
 
   closePopup7() {
     this.isPopupOpen7 = false;
   }

   // ==================================

   isPopupOpen8 = false;

   openPopup8() {
     this.isPopupOpen8 = true;
   }
 
   closePopup8() {
     this.isPopupOpen8 = false;
   }

      // ==================================

      isPopupOpen9= false;

      openPopup9() {
        this.isPopupOpen9 = true;
      }
    
      closePopup9() {
        this.isPopupOpen9 = false;
      }

         // ==================================

         isPopupOpen10= false;

         openPopup10() {
           this.isPopupOpen10 = true;
         }
       
         closePopup10() {
           this.isPopupOpen10 = false;
         }

       // ==================================

       isPopupOpen11= false;

       openPopup11() {
         this.isPopupOpen11 = true;
       }
     
       closePopup11() {
         this.isPopupOpen11 = false;
       }     
       
       // ==================================

       isPopupOpen12= false;

       openPopup12() {
         this.isPopupOpen12 = true;
       }
     
       closePopup12() {
         this.isPopupOpen12 = false;
       }     

        // ==================================

        isPopupOpen13= false;

        openPopup13() {
          this.isPopupOpen13 = true;
        }
      
        closePopup13() {
          this.isPopupOpen13 = false;
        }  
        
         // ==================================

         isPopupOpen14= false;

         openPopup14() {
           this.isPopupOpen14 = true;
         }
       
         closePopup14() {
           this.isPopupOpen14 = false;
         }  
  // ==================================

  isPopupOpen15= false;

  openPopup15() {
    this.isPopupOpen15 = true;
  }

  closePopup15() {
    this.isPopupOpen15 = false;
  }  
  // ==================================

  isPopupOpen16= false;

  openPopup16() {
    this.isPopupOpen16 = true;
  }

  closePopup16() {
    this.isPopupOpen16 = false;
  }  

    // ==================================

    isPopupOpen17= false;

    openPopup17() {
      this.isPopupOpen17 = true;
    }
  
    closePopup17() {
      this.isPopupOpen17 = false;
    }  

      // ==================================

  isPopupOpen18= false;

  openPopup18() {
    this.isPopupOpen18 = true;
  }

  closePopup18() {
    this.isPopupOpen18 = false;
  }  

    // ==================================

    isPopupOpen19= false;

    openPopup19() {
      this.isPopupOpen19 = true;
    }
  
    closePopup19() {
      this.isPopupOpen19 = false;
    }  

      // ==================================

  isPopupOpen20= false;

  openPopup20() {
    this.isPopupOpen20 = true;
  }

  closePopup20() {
    this.isPopupOpen20 = false;
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
