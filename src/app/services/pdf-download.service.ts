import { Injectable } from '@angular/core';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
@Injectable({
  providedIn: 'root'
})
export class PdfDownloadService {

  constructor() { }
  generatePDF(element: HTMLElement) {
    // const pdf = new jsPDF('landscape', 'mm', 'a4');
    // const pdfContent = document.getElementById('pdfContent');

    // if (pdfContent) {
    //   html2canvas(pdfContent).then((canvas) => {
    //     const imgData = canvas.toDataURL('image/png');
    //     const imgWidth = 297; // A4 width in mm in landscape
    //     const imgHeight = canvas.height * imgWidth / canvas.width;

    //     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    //     pdf.save('download.pdf');
    //   });
    // }
  }
}
