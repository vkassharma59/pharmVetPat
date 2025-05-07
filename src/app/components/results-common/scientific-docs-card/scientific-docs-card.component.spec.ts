import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScientificDocsCardComponent } from './scientific-docs-card.component';

describe('ScientificDocsCardComponent', () => {
  let component: ScientificDocsCardComponent;
  let fixture: ComponentFixture<ScientificDocsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScientificDocsCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScientificDocsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
