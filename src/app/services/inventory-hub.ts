import { Injectable, inject, signal, effect } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { InventoryStore } from '../store/inventory.store';
import { TenantStore } from '../store/tenant.store';
import { Item } from '../models/item';
import { Toast } from '../services/toast';

@Injectable({ providedIn: 'root' })
export class InventoryHub {
  readonly isConnected = signal(false);
  #connection!: HubConnection;
  #connectionId: string | null = null;

  #inventoryStore = inject(InventoryStore);
  #tenantStore = inject(TenantStore);
  #toast = inject(Toast);

  constructor() {
    this.#initConnectionEffect();
  }

  getConnectionId(): string | null {
    return this.#connectionId;
  }

  #initConnectionEffect(): void {
    effect(() => {
      const tenantId = this.#tenantStore.tenantName();
      if (!tenantId) return;

      if (this.#connection) {
        this.#connection.stop();
      }

      this.#connection = new HubConnectionBuilder()
        .withUrl('http://localhost:5222/hubs/inventory')
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      this.#registerConnectionStatus();
      this.#registerEventHandlers();

      this.#connection
        .start()
        .then(async () => {
          this.isConnected.set(true);
          await this.#registerTenantAndSaveConnectionId(tenantId);
          this.#toast.show(`✅ Connected to ${tenantId}`, 'success');
        })
        .catch(err => {
          console.error('[SignalR] Connection error:', err);
          this.#connectionId = null;
          this.isConnected.set(false);
          this.#toast.show('❌ Failed to connect to SignalR', 'error');
        });
    });
  }

  async #registerTenantAndSaveConnectionId(tenantId: string): Promise<void> {
    try {
      const connectionId = await this.#connection.invoke<string>('RegisterToGroup', tenantId);
      this.#connectionId = connectionId;
    } catch (err) {
      console.error('[SignalR] Failed to register tenant group:', err);
      this.#connectionId = null;
    }
  }

  #registerConnectionStatus(): void {
    this.#connection.onclose(() => {
      this.isConnected.set(false);
      this.#connectionId = null;
      this.#toast.show('🔴 Disconnected from live updates', 'info');
    });

    this.#connection.onreconnecting(() => {
      this.isConnected.set(false);
      this.#connectionId = null;
      this.#toast.show('🕐 Reconnecting to server...', 'info');
    });

    this.#connection.onreconnected(async () => {
      this.isConnected.set(true);
      const tenantId = this.#tenantStore.tenantName();
      if (tenantId) {
        await this.#registerTenantAndSaveConnectionId(tenantId);
      }
      this.#toast.show('🟢 Reconnected to live updates', 'success');
    });
  }

  #registerEventHandlers(): void {
    this.#connection.on('itemAdded', (item: Item) => {
      this.#inventoryStore.addItemDirectly(item);
      this.#toast.show(`📦 New item added: ${item.name}`, 'info');
    });

    this.#connection.on('itemUpdated', (item: Item) => {
      this.#inventoryStore.updateItemDirectly(item.id, item);
      this.#toast.show(`✏️ Item updated: ${item.name}`, 'info');
    });

    this.#connection.on('itemDeleted', ({ id }: { id: number }) => {
      this.#inventoryStore.deleteItemDirectly(id);
      this.#toast.show('🗑️ Item deleted', 'info');
    });
  }
}
