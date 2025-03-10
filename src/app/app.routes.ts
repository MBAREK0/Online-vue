import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login/login.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { DashboardComponent} from "../features/dashboard/dashboard.component";
import {HomeComponent} from "../features/home/home.component";
import {WorkExperienceComponent} from "../features/work-experiences/work-experiences.component";
import {authGuard} from "../core/guards/auth.guard";
import {PortfolioLanguagesComponent} from "../features/auth/portfolio-languages/portfolio-languages.component";
import {portfolioLanguagesResolverResolver} from "../core/resolvers/portfolio-languages-resolver.resolver";

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
    path: 'auth/ptl',
    component: PortfolioLanguagesComponent,
    resolve: {
      canAccess: portfolioLanguagesResolverResolver
    }
  },
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        canActivate: [authGuard],
        // data: { role: ['MEMBER','ADMIN'], permissions: ['CAN_VIEW_RANKINGS','CAN_VIEW_COMPETITIONS','CAN_PARTICIPATE'] },
      },
      {
        path:'work-experiences',
        component : WorkExperienceComponent,
        canActivate: [authGuard],

      }

      ]
  },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
];
