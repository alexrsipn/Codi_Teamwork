import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '../../plugin.store';
import { concatMap, tap } from 'rxjs';
import { Router } from '@angular/router';

interface InitialState {
  steps: string[];
  currentStep: number;
  activityId?: number;
  serviceSolicitation?: string;
}

const initialState = {
  steps: [],
  currentStep: 0,
  activityId: 888,
};

@Injectable()
export class InitialStore extends ComponentStore<InitialState> {
  constructor(
    private readonly globalStore: Store,
    private readonly router: Router
  ) {
    super(initialState);
    this.loadGlobalProps();
  }
  // View Model
  readonly vm$ = this.select((state) => state);

  // Updaters
  readonly setOfsProperties = this.updater(
    (state, { activityId, serviceSolicitation }: any) => ({
      ...state,
      activityId,
      serviceSolicitation,
    })
  );
  readonly setSteps = this.updater((state, steps: string[]) => ({
    ...state,
    steps,
  }));
  readonly setCurrentStep = this.updater((state, currentStep: number) => ({
    ...state,
    currentStep,
  }));

  // Effects
  readonly loadGlobalProps = this.effect(($) =>
    $.pipe(
      concatMap((_) => this.globalStore.ofsProperties),
      tap((props) => this.setOfsProperties(props)),
      tap((props) => console.log(props)),
      tap(() => this.createSteps())
    )
  );

  readonly close = this.effect(($) =>
    $.pipe(tap((_) => this.globalStore.close()))
  );

  readonly Initial = this.effect(($) =>
    $.pipe(
      tap(() => console.log('Inicial')),
      // tap(() => alert('Valor de OFSC: ' + this.get().activityId)),
      tap(() => this.navigateToNext())
    )
  );

  // Aux
  private createSteps() {
    const steps = ['/list'];
    steps.push('/resume');
    this.setSteps(steps);
  }

  private navigateToNext() {
    const { steps, currentStep } = this.get();
    const nextStep = currentStep + 1;
    this.setCurrentStep(nextStep);

    const nextPage = steps[nextStep];
    this.router.navigate([nextPage]);
  }
}
