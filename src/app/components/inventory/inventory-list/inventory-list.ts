import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryStore } from '../../../store/inventory.store';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Item } from '../../../models/item';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ItemForm } from '../item-form/item-form';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.scss'
})
export class InventoryListComponent {
  readonly store = inject(InventoryStore);

  #dialog = inject(MatDialog);

  displayedColumns = ['name', 'category', 'status', 'actions'];

  checkout(id: number) {
    this.store.checkoutItem(id);
  }

  checkin(id: number) {
    this.store.checkinItem(id);
  }

  remove(id: number) {
    this.store.deleteItem(id);
  }

  openEditDialog(item: Item): void {
    this.#dialog.open(ItemForm, {
      width: '400px',
      data: item
    });
  }
}
