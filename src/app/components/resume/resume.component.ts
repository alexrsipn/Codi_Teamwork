import { Component } from '@angular/core';
import { ResumeStore } from './resume.store';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  providers: [ResumeStore],
  templateUrl: './resume.component.html',
})
export class ResumeComponent {
  protected vm$ = this.store.vm$;
  constructor(protected readonly store: ResumeStore) {}
  // Resume() {
  //   this.store.Resume();
  // }
  close() {
    this.store.close();
  }
}
