import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GppdDbCardComponent } from './gppd-db-card.component';

describe('GppdDbCardComponent', () => {
  let component: GppdDbCardComponent;
  let fixture: ComponentFixture<GppdDbCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GppdDbCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GppdDbCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
