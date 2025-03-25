import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InitialStore } from './initial.store';
import { Store } from 'src/app/plugin.store';
import Image from 'image-js';

@Component({
  selector: 'app-initial',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSlideToggleModule],
  providers: [InitialStore],
  templateUrl: './initial.component.html',
})
export class InitialComponent {
  protected vm$ = this.store.vm$;

  // constructor(protected readonly store: InitialStore) {}
  constructor(protected readonly store: Store) {}

  createImageFromBlob(image: Blob): any {
    const imageUrl = URL.createObjectURL(image);
    return imageUrl;
  }

  createImageFromBlobTest(image: Blob): any {
    const imageUrl = URL.createObjectURL(image);
    return imageUrl;
  }

  createImageBase(image: Image): any {
    const imageUrl = image.rgba8().toBase64();
    console.log(imageUrl);
    return imageUrl;
  }

  Initial() {
    this.store.getClientSignature();
    this.store.getTechnitianSignature();
  }

  close() {
    this.store.close();
  }
}
