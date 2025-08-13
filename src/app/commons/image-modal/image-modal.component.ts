import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  Renderer2,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.css',
})
export class ImageModalComponent implements AfterViewInit {
  @ViewChild('mainDiv', { static: true }) mainDiv!: ElementRef;

  zoomArr: number[] = [1, 1.2, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];
  indexofArr: number = 0;
  currentZoom: number = this.zoomArr[this.indexofArr];
  showZoomControls = true;

  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    private renderer: Renderer2,
    @Inject(MAT_DIALOG_DATA)
    public data: { dataImage: string; showZoomControls?: boolean }
  ) {
    this.showZoomControls = this.data.showZoomControls ?? true;
  }

  ngAfterViewInit(): void {
    this.applyZoom();
  }

  zoomIn() {
    if (this.indexofArr < this.zoomArr.length - 1) {
      this.indexofArr++;
      this.applyZoom();
    }
  }

  zoomOut() {
    if (this.indexofArr > 0) {
      this.indexofArr--;
      this.applyZoom();
    }
  }

  applyZoom() {
    this.currentZoom = this.zoomArr[this.indexofArr];

    // Apply scaling
    this.renderer.setStyle(
      this.mainDiv.nativeElement,
      'transform',
      `scale(${this.currentZoom})`
    );

    // Keep zoom centered
    this.renderer.setStyle(
      this.mainDiv.nativeElement,
      'transform-origin',
      'top left'
    );

    // Ensure scrolling is possible when zoomed in
    const parent = this.mainDiv.nativeElement.parentElement;
    if (parent) {
      this.renderer.setStyle(parent, 'overflow', 'auto');
    }
  }

  closeModal() {
    this.dialogRef.close();
  }
}
