import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class Toast {
  #snackbar = inject(MatSnackBar);

  show(text: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    this.#snackbar.open(text, 'close', {
      duration,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}
