import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalRoutesComponent } from './technical-routes.component';

describe('TechnicalRoutesComponent', () => {
  let component: TechnicalRoutesComponent;
  let fixture: ComponentFixture<TechnicalRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalRoutesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechnicalRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
