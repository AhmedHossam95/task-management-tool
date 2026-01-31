import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  show(message: string, type: ToastType = 'info', action?: string): void {
    this.snackBar.open(message, action ?? 'Dismiss', {
      ...this.defaultConfig,
      panelClass: [`toast-${type}`],
    });
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string, action?: string): void {
    this.show(message, 'error', action);
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }
}
