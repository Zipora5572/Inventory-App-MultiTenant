import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import { inject, computed, effect } from '@angular/core';
import { finalize, tap } from 'rxjs/operators';
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

    effect(() => {
      const tenant = tenantStore.tenantName();
      tenant ? loadItems() : clearItems();
    });

    const loadItems = (): void => {
      patchState(store, { isLoading: true });

      inventoryService.getAll().pipe(
        tap(items => patchState(store, { items })),
        finalize(() => patchState(store, { isLoading: false }))
      ).subscribe({
        error: err => {
          console.error('[InventoryStore] Load failed:', err);
          patchState(store, { items: [] });
          const tenantId = tenantStore.tenantName();
  if (tenantId) {
    toast.show('Failed to load items', 'error');
  }
        }
      });
    };

    const clearItems = (): void => {
      patchState(store, { items: [] });
    };

    const addItem = (item: Partial<Item>): void => {
      inventoryService.create(item).subscribe({
        next: newItem => {
          patchState(store, state => ({
            items: [...state.items, newItem],
          }));
          toast.show('Item added successfully', 'success');
        },
        error: err => {
          console.error('[InventoryStore] Add failed:', err);
          toast.show('Failed to add item', 'error');
        },
      });
    };

    const updateItem = (id: number, changes: Partial<Item>): void => {
      inventoryService.update(id, changes).subscribe({
        next: updatedItem => {
          patchState(store, state => ({
            items: state.items.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            ),
          }));
          toast.show('Item updated successfully', 'success');
        },
        error: err => {
          console.error('[InventoryStore] Update failed:', err);
          toast.show('Failed to update item', 'error');
        },
      });
    };

  const checkoutItem = (id: number): void => {
  inventoryService.checkout(id).subscribe({
    next: () => {
      loadItems();
      toast.show('Item checked out', 'success');
    },
    error: err => {
      console.error('[InventoryStore] Checkout failed:', err);
      if (err.status === 403) {
        toast.show('Access denied: you are not authorized to check out this item.', 'error');
      } else {
        toast.show('Failed to check out item', 'error');
      }
    },
  });
};


    const checkinItem = (id: number): void => {
      inventoryService.checkin(id).subscribe({
        next: () => {
          loadItems();
          toast.show('Item checked in', 'success');
        },
        error: err => {
          console.error('[InventoryStore] Checkin failed:', err);
          toast.show('Failed to check in item', 'error');
        },
      });
    };

    const deleteItem = (id: number): void => {
      inventoryService.softDelete(id).subscribe({
        next: () => {
          patchState(store, state => ({
            items: state.items.filter(item => item.id !== id),
          }));
          toast.show('Item deleted successfully', 'success');
        },
        error: err => {
          console.error('[InventoryStore] Delete failed:', err);
          toast.show('Failed to delete item', 'error');
        },
      });
    };

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
