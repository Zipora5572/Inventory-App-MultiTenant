import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import { inject, computed, effect } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Inventory } from '../services/inventory';
import { Item } from '../models/item';
import { TenantStore } from './tenant.store';
import { Toast } from '../services/toast';

type InventoryState = {
  items: Item[];
  isLoading: boolean;
};

const initialState: InventoryState = {
  items: [],
  isLoading: false,
};

export const InventoryStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ items }) => ({
    availableItems: computed(() =>
      items().filter(item => !item.isCheckedOut)
    ),
    checkedOutItems: computed(() =>
      items().filter(item => item.isCheckedOut)
    ),
  })),

  withMethods((store, inventoryService = inject(Inventory)) => {
    const tenantStore = inject(TenantStore);
    const toast = inject(Toast);

    const handleError = (context: string, err: unknown): void => {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`[InventoryStore] ${context} failed:`, message);
      toast.show(`Failed to ${context.toLowerCase()}`, 'error');
    };

    const loadItems = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => inventoryService.getAll()),
        tapResponse({
          next: items => {
            patchState(store, { items, isLoading: false });
          },
          error: err => {
            patchState(store, { items: [], isLoading: false });
            handleError('Load', err);
          }
        })
      )
    );


    const clearItems = (): void => {
      patchState(store, { items: [] });
    };

    const addItem = rxMethod<Partial<Item>>(
      pipe(
        switchMap(item => inventoryService.create(item)),
        tapResponse({
          next: newItem => {
            toast.show('Item added successfully', 'success');
            loadItems();
          },
          error: err => handleError('Add', err),
        })
      )
    );

    const updateItem = rxMethod<{ id: number; changes: Partial<Item> }>(
      pipe(
        switchMap(({ id, changes }) =>
          inventoryService.update(id, changes)
        ),
        tapResponse({
          next: () => {
            toast.show('Item updated successfully', 'success');
            loadItems();
          },
          error: err => handleError('Update', err),
        })
      )
    );

    const checkoutItem = rxMethod<number>(
      pipe(
        switchMap(id => inventoryService.checkout(id)),
        tapResponse({
          next: () => {
            loadItems();
            toast.show('Item checked out', 'success');
          },
          error: (err: unknown) => {
            const message = err instanceof Error ? err.message : '';
            const isForbidden = typeof err === 'object' && err !== null && 'status' in err && (err as any).status === 403;
            console.error('[InventoryStore] Checkout failed:', message);
            toast.show(
              isForbidden
                ? 'Access denied: not authorized.'
                : 'Failed to check out item',
              'error'
            );
          },
        })
      )
    );

    const checkinItem = rxMethod<number>(
      pipe(
        switchMap(id => inventoryService.checkin(id)),
        tapResponse({
          next: () => {
            loadItems();
            toast.show('Item checked in', 'success');
          },
          error: err => handleError('Checkin', err),
        })
      )
    );

    const deleteItem = rxMethod<number>(
      pipe(
        switchMap(id =>
          inventoryService.softDelete(id).pipe(
            tapResponse({
              next: () => {
                toast.show('Item deleted successfully', 'success');
                loadItems();
              },
              error: err => handleError('Delete', err),
            })
          )
        )
      )
    );

    effect(() => {
      const tenant = tenantStore.tenantName();
      tenant ? loadItems() : clearItems();
    });

    return {
      loadItems,
      clearItems,
      addItem,
      updateItem,
      checkoutItem,
      checkinItem,
      deleteItem,
    };
  })
);
