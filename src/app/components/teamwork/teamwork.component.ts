import { Component } from '@angular/core';
import {Store} from "../../plugin.store";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatListModule, MatListOption} from "@angular/material/list";
import {MatButtonModule} from "@angular/material/button";
import {GetAResourceResponse} from "../../types/ofs-rest-api";

@Component({
  selector: 'app-teamwork',
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf,
    MatListModule,
    MatButtonModule
  ],
  templateUrl: './teamwork.component.html',
})
export class TeamworkComponent {
  protected vm$ = this.store.vm$;

  constructor(protected readonly store: Store ) {}

  onSelectionChange(selectedOptions: MatListOption[]) {
    const selectedResources: GetAResourceResponse[] = selectedOptions.map(option => option.value);
    this.store.setSelectedTechnicians(selectedResources);
  }

  sendTechnicians() {
    this.store.sendTechnicians();
  }

/*  assignTechnicians () {
    const selectedResources: GetAResourceResponse[] = selectedOptions.map(option => option.value);
    console.log(selectedResources);
  }*/
}
