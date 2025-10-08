import { Route } from '@angular/router';
import {TeamworkComponent} from "./components/teamwork/teamwork.component";

export const ROUTES: Route[] = [
  {
    path: 'codi_teamWork',
    component: TeamworkComponent,
  },
  {
    path: '',
    redirectTo: 'codi_teamWork',
    pathMatch: 'full',
  },
  {
    path: '*',
    redirectTo: 'codi_teamWork',
    pathMatch: 'full',
  },
];
