import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalRoutesCardComponent } from './technical-routes-card.component';

describe('TechnicalRoutesCardComponent', () => {
  let component: TechnicalRoutesCardComponent;
  let fixture: ComponentFixture<TechnicalRoutesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalRoutesCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechnicalRoutesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
