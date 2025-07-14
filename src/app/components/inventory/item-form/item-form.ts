import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InventoryStore } from '../../../store/inventory.store';
import { Item } from '../../../models/item';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
      CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './item-form.html',
  styleUrl: './item-form.scss'
})
export class ItemForm implements OnInit {
  #fb = inject(FormBuilder);
  #store = inject(InventoryStore);
  #dialogRef = inject(MatDialogRef<ItemForm>);
  #itemToEdit = inject(MAT_DIALOG_DATA, { optional: true }) as Item | null;

  submitted = false;
  isSubmitting = false;

  form = this.#fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    category: ['', Validators.required]
  });

  get isEditMode(): boolean {
    return !!this.#itemToEdit;
  }

  ngOnInit(): void {
    if (this.#itemToEdit) {
      this.form.patchValue({
        name: this.#itemToEdit.name,
        category: this.#itemToEdit.category
      });
    }
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.isSubmitting = true;

    const { name, category } = this.form.value;
    const payload = {
      name: name!.trim(),
      category: category!.trim()
    };

    if (this.isEditMode) {
      this.#store.updateItem(this.#itemToEdit!.id, payload);
    } else {
      this.#store.addItem(payload);
    }

    this.isSubmitting = false;
    this.#dialogRef.close();
  }
}
