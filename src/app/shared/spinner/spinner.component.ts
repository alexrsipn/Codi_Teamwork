import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerService } from '../../services/spinner.service';

@Component({
    selector: 'app-spinner',
    imports: [CommonModule, MatProgressSpinnerModule],
    template: `
      <div class="fixed w-full left-0 top-0 bottom-0 bg-gray-700/70 z-50 flex flex-col justify-center items-center" *ngIf="loading$ | async">
        <mat-spinner [diameter]="50"></mat-spinner>
        <p class="text-white">Cargando...</p>
      </div>
  `,
})
export class SpinnerComponent {
  loading$ = this.loading.isLoading();

  constructor(public loading: SpinnerService) {}
}
