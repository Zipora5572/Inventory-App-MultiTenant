import { TestBed } from '@angular/core/testing';

import { InventoryHub } from './inventory-hub';

describe('InventoryHub', () => {
  let service: InventoryHub;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryHub);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
