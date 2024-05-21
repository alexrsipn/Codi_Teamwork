import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, concatMap, tap } from 'rxjs';
import { OfsMessageService } from './services/ofs-message.service';
import { Message } from './types/models/message';

interface State {
  activityId?: number;
  serviceSolicitation?: string;
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
    // this.loadGlobalProps();
  }

  // Selectors
  readonly vm$ = this.select((state) => state);

  readonly ofsProperties = this.select(
    ({ activityId, serviceSolicitation }) => ({
      activityId,
      serviceSolicitation,
    })
  );

  //Updaters
  readonly setFromOfsMessage = this.updater((state, message: Message) => {
    return {
      ...state,
      activityId: message.activity.aid,
      serviceSolicitation: message.activity.appt_number,
    };
  });
  readonly setOfsProperties = this.updater(
    (state, { activityId, serviceSolicitation }: any) => ({
      ...state,
      activityId,
      serviceSolicitation,
    })
  );
  readonly loadGlobalProps = this.effect(($) =>
    $.pipe(
      concatMap(() => this.ofsProperties),
      tap((props) => this.setOfsProperties(props)),
      tap((props) => console.log(props))
    )
  );
}
