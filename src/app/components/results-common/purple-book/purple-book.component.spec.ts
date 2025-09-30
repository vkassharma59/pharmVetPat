import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurpleBookComponent } from './purple-book.component';

describe('PurpleBookComponent', () => {
  let component: PurpleBookComponent;
  let fixture: ComponentFixture<PurpleBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurpleBookComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurpleBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
