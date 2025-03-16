import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JapanPMDAComponent } from './japan-pmda.component';

describe('JapanPMDAComponent', () => {
  let component: JapanPMDAComponent;
  let fixture: ComponentFixture<JapanPMDAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JapanPMDAComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JapanPMDAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
