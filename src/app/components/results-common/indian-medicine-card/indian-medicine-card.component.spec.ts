import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndianMedicineCardComponent } from './indian-medicine-card.component';

describe('IndianMedicineCardComponent', () => {
  let component: IndianMedicineCardComponent;
  let fixture: ComponentFixture<IndianMedicineCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndianMedicineCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndianMedicineCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
