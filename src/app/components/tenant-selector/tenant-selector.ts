import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { TenantStore } from '../../store/tenant.store';

@Component({
  selector: 'app-tenant-selector',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatOptionModule],
  templateUrl: './tenant-selector.html',
  styleUrl: './tenant-selector.scss'
})
export class TenantSelector implements OnInit {
  #tenantStore = inject(TenantStore);

  tenants = this.#tenantStore.tenantsList;
  selectedTenant = this.#tenantStore.tenantName;

  ngOnInit() {
    this.#tenantStore.loadAllTenants();
  }

  onChange(name: string) {
    this.#tenantStore.setTenant(name);
  }
}
