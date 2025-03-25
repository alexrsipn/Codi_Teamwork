import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '../../plugin.store';
import { concatMap, tap } from 'rxjs';

interface ResumeState {
  customer_number?: number;
}

const initialResumeState = {
  customer_number: 777,
};

@Injectable()
export class ResumeStore extends ComponentStore<ResumeState> {
  constructor(private readonly globalStore: Store) {
    super(initialResumeState);
    this.loadGlobalProps();
  }

  // View Model
  readonly vm$ = this.select((state) => state);

  // Updaters
  readonly setOfsProperties = this.updater(
    (state, { customer_number }: any) => ({
      ...state,
      customer_number,
    })
  );

  // Effects
  readonly loadGlobalProps = this.effect(($) =>
    $.pipe(
      concatMap((_) => this.globalStore.ofsProperties),
      tap((props) => this.setOfsProperties(props)),
      // tap((props) => console.log(props))
    )
  );

  readonly close = this.effect(($) =>
    $.pipe(tap((_) => this.globalStore.close()))
  );
}
