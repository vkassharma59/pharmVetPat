import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicRouteCardComponent } from './basic-route-card.component';

describe('BasicRouteCardComponent', () => {
  let component: BasicRouteCardComponent;
  let fixture: ComponentFixture<BasicRouteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicRouteCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BasicRouteCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
