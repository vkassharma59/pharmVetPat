import { TestBed } from '@angular/core/testing';

import { ServiceResultTabFiltersService } from './service-result-tab-filters.service';

describe('ServiceResultTabFiltersService', () => {
  let service: ServiceResultTabFiltersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceResultTabFiltersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
