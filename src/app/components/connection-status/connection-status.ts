import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryHub } from '../../services/inventory-hub';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-connection-status',
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './connection-status.html',
  styleUrl: './connection-status.scss'
})
export class ConnectionStatus {
  #hub = inject(InventoryHub);
  readonly isConnected = this.#hub.isConnected;

  get icon(): string {
    return this.isConnected() ? 'wifi' : 'wifi_off';
  }

  get statusColor(): 'primary' | 'warn' {
    return this.isConnected() ? 'primary' : 'warn';
  }

  get tooltip(): string {
    return this.isConnected() ? 'Connected to live updates' : 'Not connected';
  }
}
