import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, concatMap, tap } from 'rxjs';
import { OfsMessageService } from './services/ofs-message.service';
import { Message } from './types/models/message';

interface State {
  activityId?: number;
  serviceSolicitation?: string;
  customer_number?: number;
}

const initialState = {
  activityId: 99999,
  serviceSolicitation: '81-99999999',
};

@Injectable({
  providedIn: 'root',
})
export class Store extends ComponentStore<State> {
  constructor(
    private readonly router: Router,
    private readonly ofs: OfsMessageService
  ) {
    super(initialState);
  }

  // Selectors
  readonly vm$ = this.select((state) => state);

  readonly ofsProperties = this.select(
    ({ activityId, serviceSolicitation, customer_number }) => ({
      activityId,
      serviceSolicitation,
      customer_number,
    })
  );

  //Updaters
  readonly setFromOfsMessage = this.updater((state, message: Message) => {
    return {
      ...state,
      activityId: message.activity.aid,
      serviceSolicitation: message.activity.appt_number,
      customer_number: message.activity.customer_number,
    };
  });

  readonly loadGlobalProps = this.effect(($) =>
    $.pipe(concatMap(() => this.ofsProperties))
  );

  // Effects
  readonly close = this.effect(($) => $.pipe(tap((_) => this.ofs.close())));
}
