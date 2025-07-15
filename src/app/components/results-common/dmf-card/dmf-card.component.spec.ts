import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmfCardComponent } from './dmf-card.component';

describe('DmfCardComponent', () => {
  let component: DmfCardComponent;
  let fixture: ComponentFixture<DmfCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmfCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmfCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
