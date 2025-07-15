import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Tenant as TenantModel } from '../models/tenant';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

const TENANT_ID_KEY = 'tenant-id';

type TenantState = {
  tenantName: string | null;
  allTenants: TenantModel[];
  isLoadingTenants: boolean;
};

const initialState: TenantState = {
  tenantName: localStorage.getItem(TENANT_ID_KEY),
  allTenants: [],
  isLoadingTenants: false,
};

export const TenantStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ tenantName, allTenants }) => ({
    hasTenant: computed(() => !!tenantName()),
    tenantsList: computed(() => allTenants()),
    selectedTenant: computed(() =>
      allTenants().find(t => t.name === tenantName()) ?? null
    ),
  })),

  withMethods((store) => {
    const http = inject(HttpClient);

    const setTenant = (tenantName: string): void => {
      localStorage.setItem(TENANT_ID_KEY, tenantName);
      patchState(store, { tenantName });
    };

    const resetTenant = (): void => {
      localStorage.removeItem(TENANT_ID_KEY);
      patchState(store, { tenantName: null });
    };

    const loadAllTenants = rxMethod<void>(
      switchMap(() => {
        if (store.allTenants().length > 0) return [];

        patchState(store, { isLoadingTenants: true });

        return http.get<TenantModel[]>(`${environment.apiUrl}/tenants`).pipe(
          tapResponse({
            next: tenants => patchState(store, { allTenants: tenants }),
            error: err => {
              console.error('[TenantStore] Failed loading all tenants', err);
              patchState(store, { allTenants: [] });
            },
            finalize: () => patchState(store, { isLoadingTenants: false }),
          })
        );
      })
    );

    return {
      setTenant,
      resetTenant,
      loadAllTenants,
    };
  })
);
