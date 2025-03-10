import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsmComponent } from './ksm.component';

describe('KsmComponent', () => {
  let component: KsmComponent;
  let fixture: ComponentFixture<KsmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KsmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
