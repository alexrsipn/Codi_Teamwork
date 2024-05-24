import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InitialStore } from './initial.store';

@Component({
  selector: 'app-initial',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatSlideToggleModule],
  providers: [InitialStore],
  templateUrl: './initial.component.html',
})
export class InitialComponent {
  protected vm$ = this.store.vm$;

  constructor(protected readonly store: InitialStore) {}

  Initial() {
    this.store.Initial();
  }

  close() {
    this.store.close();
  }
}
