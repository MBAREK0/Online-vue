import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login/login.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { DashboardComponent} from "../features/dashboard/dashboard.component";
import {HomeComponent} from "../features/home/home.component";
import {WorkExperienceComponent} from "../features/work-experiences/work-experiences.component";

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: 'auth/register',
    component: RegisterComponent
  },
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path:'work-experiences',
        component : WorkExperienceComponent

      }

      ]
  },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
];
