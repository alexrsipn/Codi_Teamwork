import { Route } from '@angular/router';
import { InitialComponent } from './components/initial/initial.component';
import { ResumeComponent } from './components/resume/resume.component';

export const ROUTES: Route[] = [
  {
    path: 'initial',
    component: InitialComponent,
  },
  {
    path: 'resume',
    component: ResumeComponent,
  },
  {
    path: '',
    redirectTo: 'initial',
    pathMatch: 'full',
  },
  {
    path: '*',
    redirectTo: 'initial',
    pathMatch: 'full',
  },
];
