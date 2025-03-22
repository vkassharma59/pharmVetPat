import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chem_Robotics_QueryModalComponent } from './Chem_Robotics_QueryModal.component';

describe('Chem_Robotics_QueryModalComponent', () => {
  let component: Chem_Robotics_QueryModalComponent;
  let fixture: ComponentFixture<Chem_Robotics_QueryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chem_Robotics_QueryModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Chem_Robotics_QueryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
