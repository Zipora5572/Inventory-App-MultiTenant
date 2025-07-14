import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryListComponent } from '../../components/inventory/inventory-list/inventory-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ItemForm } from '../../components/inventory/item-form/item-form';
import { InventoryStore } from '../../store/inventory.store';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [MatProgressSpinnerModule, InventoryListComponent, MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    ],
  templateUrl: './inventory-management.html',
  styleUrl: './inventory-management.scss'
})
export class InventoryManagement implements OnInit {
   #store = inject(InventoryStore);
   #dialog = inject(MatDialog);

  ngOnInit(): void {
    this.#store.loadItems();
  }

  openAddDialog(): void {
    this.#dialog.open(ItemForm, {
      width: '400px',
      disableClose: true,
    });
  }

}

