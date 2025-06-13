import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EximCardComponent } from './exim-card.component';

describe('EximCardComponent', () => {
  let component: EximCardComponent;
  let fixture: ComponentFixture<EximCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EximCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EximCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
