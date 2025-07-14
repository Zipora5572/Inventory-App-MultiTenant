import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { TenantStore } from '../store/tenant.store';

@Injectable({ providedIn: 'root' })
export class Tenant {
  #tenantStore = inject(TenantStore);
  readonly tenantId = this.#tenantStore.tenantName;
  readonly tenantsList = this.#tenantStore.tenantsList;
  readonly selectedTenant = this.#tenantStore.selectedTenant;

  setTenant(name: string) {
    this.#tenantStore.setTenant(name);
  }

  resetTenant() {
    this.#tenantStore.resetTenant();
  }

  loadAllTenants() {
    this.#tenantStore.loadAllTenants();
  }
}
