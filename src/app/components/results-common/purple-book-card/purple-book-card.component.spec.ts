import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurpleBookCardComponent } from './purple-book-card.component';

describe('PurpleBookCardComponent', () => {
  let component: PurpleBookCardComponent;
  let fixture: ComponentFixture<PurpleBookCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurpleBookCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurpleBookCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
