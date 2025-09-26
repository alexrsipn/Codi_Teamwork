import { Component } from '@angular/core';
import {Store} from "../../plugin.store";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-teamwork',
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf
  ],
  templateUrl: './teamwork.component.html',
})
export class TeamworkComponent {
  protected vm$ = this.store.vm$;

  constructor(protected readonly store: Store ) {}
}
