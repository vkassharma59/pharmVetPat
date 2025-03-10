import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpcdbComponent } from './spcdb.component';

describe('SpcdbComponent', () => {
  let component: SpcdbComponent;
  let fixture: ComponentFixture<SpcdbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpcdbComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpcdbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
