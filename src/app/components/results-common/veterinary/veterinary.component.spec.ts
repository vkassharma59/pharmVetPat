import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeterinaryComponent } from './veterinary.component';

describe('VeterinaryComponent', () => {
  let component: VeterinaryComponent;
  let fixture: ComponentFixture<VeterinaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeterinaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VeterinaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
