import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantSelector } from './tenant-selector';

describe('TenantSelector', () => {
  let component: TenantSelector;
  let fixture: ComponentFixture<TenantSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
