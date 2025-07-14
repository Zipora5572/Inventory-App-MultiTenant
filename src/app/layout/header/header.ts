import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { TenantStore } from '../../store/tenant.store';
import { TenantSelector } from '../../components/tenant-selector/tenant-selector';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    TenantSelector
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  #router = inject(Router);
  #tenantStore = inject(TenantStore);

  userName = 'User';

  tenantIdSignal = this.#tenantStore.tenantName;
  tenants = this.#tenantStore.tenantsList;

  ngOnInit() {
    this.#tenantStore.loadAllTenants(); 
  }

  onTenantChange(name: string) {
    this.#tenantStore.setTenant(name);
  }

  logout() {
    this.#tenantStore.resetTenant();
    this.#router.navigate(['/login']);
  }
}
