import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OfsMessageService } from './services/ofs-message.service';
import { SpinnerService } from './services/spinner.service';
import { Store } from './plugin.store';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [
      CommonModule,
      RouterModule,
      SpinnerComponent,
      MatButtonModule,
      MatIconModule]
})
export class AppComponent {
/*  constructor(
    private readonly ofs: OfsMessageService,
    private readonly store: Store
  ) {
    ofs.getMessage().subscribe(ofs.message);
  }*/
  constructor(protected readonly store: Store, protected readonly spinner: SpinnerService) {}
}
