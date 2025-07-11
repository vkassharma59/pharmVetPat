import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmfComponent } from './dmf.component';

describe('DmfComponent', () => {
  let component: DmfComponent;
  let fixture: ComponentFixture<DmfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
