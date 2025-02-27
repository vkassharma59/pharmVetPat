import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KoreaComponent } from './korea.component';

describe('KoreaComponent', () => {
  let component: KoreaComponent;
  let fixture: ComponentFixture<KoreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KoreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KoreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
