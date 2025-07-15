import { Injectable, inject, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { InventoryStore } from '../store/inventory.store';
import { TenantStore } from '../store/tenant.store';
import { Item } from '../models/item';
import { Toast } from '../services/toast';

@Injectable({ providedIn: 'root' })
export class InventoryHub {
  readonly isConnected = signal(false);

  #connection!: HubConnection;
  #inventoryStore = inject(InventoryStore);
  #tenantStore = inject(TenantStore);
  #toast = inject(Toast);

  constructor() {
    const tenantId = this.#tenantStore.tenantName();
    if (!tenantId) return;

    this.#connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5222/hubs/inventory')
       .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.#registerConnectionStatus();
    this.#registerEventHandlers(tenantId);

    this.#connection.start()
      .then(() => {
        this.isConnected.set(true);
        this.#toast.show('✅ Connected to live updates', 'success');
      })
      .catch(err => {
        console.error('[SignalR] Connection error:', err);
        this.#toast.show('❌ Failed to connect to live updates', 'error');
      });
  }

  #registerConnectionStatus(): void {
    this.#connection.onclose(() => {
      this.isConnected.set(false);
      this.#toast.show('🔴 Disconnected from live updates', 'info');
    });

    this.#connection.onreconnecting(() => {
      this.isConnected.set(false);
      this.#toast.show('🕐 Reconnecting to server...', 'info');
    });

    this.#connection.onreconnected(() => {
      this.isConnected.set(true);
      this.#toast.show('🟢 Reconnected to live updates', 'success');
    });
  }

  #registerEventHandlers(tenantId: string): void {
    this.#connection.on('itemAdded', (item: Item) => {
      if (item.tenantId === tenantId) {
        this.#inventoryStore.addItemDirectly(item);
        this.#toast.show(`📦 New item added: ${item.name}`, 'info');
      }
    });

    this.#connection.on('itemUpdated', (item: Item) => {
      if (item.tenantId === tenantId) {
        this.#inventoryStore.updateItemDirectly(item.id, item);
        this.#toast.show(`✏️ Item updated: ${item.name}`, 'info');
      }
    });

    this.#connection.on('itemDeleted', ({ id, tenantId: eventTenant, name }: { id: number; tenantId: string; name: string }) => {
      if (eventTenant === tenantId) {
        this.#inventoryStore.deleteItemDirectly(id);
        this.#toast.show("🗑️ Item deleted", 'info');
       }
    });
  }
}
