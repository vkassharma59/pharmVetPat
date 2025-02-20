import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EximComponent } from './exim.component';

describe('EximComponent', () => {
  let component: EximComponent;
  let fixture: ComponentFixture<EximComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EximComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EximComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
