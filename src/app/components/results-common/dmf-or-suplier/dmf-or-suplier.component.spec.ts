import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmfOrSuplierComponent } from './dmf-or-suplier.component';

describe('DmfOrSuplierComponent', () => {
  let component: DmfOrSuplierComponent;
  let fixture: ComponentFixture<DmfOrSuplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmfOrSuplierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmfOrSuplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
