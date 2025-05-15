import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GppdDbComponent } from './gppd-db.component';

describe('GppdDbComponent', () => {
  let component: GppdDbComponent;
  let fixture: ComponentFixture<GppdDbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GppdDbComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GppdDbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
