import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadreportmodalComponent } from './downloadreportmodal.component';

describe('DownloadreportmodalComponent', () => {
  let component: DownloadreportmodalComponent;
  let fixture: ComponentFixture<DownloadreportmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadreportmodalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DownloadreportmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
