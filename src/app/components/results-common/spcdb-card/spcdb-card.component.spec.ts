import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpcdbCardComponent } from './spcdb-card.component';

describe('SpcdbCardComponent', () => {
  let component: SpcdbCardComponent;
  let fixture: ComponentFixture<SpcdbCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpcdbCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpcdbCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
