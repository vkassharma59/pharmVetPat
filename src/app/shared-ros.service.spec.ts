import { TestBed } from '@angular/core/testing';

import { SharedRosService } from './shared-ros.service';

describe('SharedRosService', () => {
  let service: SharedRosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedRosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
