import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpPatentsCardComponent } from './imp-patents-card.component';

describe('ImpPatentsCardComponent', () => {
  let component: ImpPatentsCardComponent;
  let fixture: ComponentFixture<ImpPatentsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpPatentsCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImpPatentsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
