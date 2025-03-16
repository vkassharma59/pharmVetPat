import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KoreaOrangebookComponent } from './korea-orangebook.component';

describe('KoreaOrangebookComponent', () => {
  let component: KoreaOrangebookComponent;
  let fixture: ComponentFixture<KoreaOrangebookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KoreaOrangebookComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KoreaOrangebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
