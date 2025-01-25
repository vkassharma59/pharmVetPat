import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemicalDirectoryDataCardComponent } from './chemical-directory-data-card.component';

describe('ChemicalDirectoryDataCardComponent', () => {
  let component: ChemicalDirectoryDataCardComponent;
  let fixture: ComponentFixture<ChemicalDirectoryDataCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChemicalDirectoryDataCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChemicalDirectoryDataCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
