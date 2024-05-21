import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfsMessageService } from './services/ofs-message.service';
import { Store } from './plugin.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet],
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Plugin OFSC Sky';
  constructor(
    private readonly ofs: OfsMessageService,
    private readonly store: Store
  ) {
    ofs.getMessage().subscribe(this.store.setFromOfsMessage);
  }
}
