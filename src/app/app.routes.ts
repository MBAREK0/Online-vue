import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login/login.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { DashboardComponent} from "../features/dashboard/dashboard.component";
import {HomeComponent} from "../features/home/home.component";
import {WorkExperienceComponent} from "../features/work-experiences/work-experiences.component";
import {authGuard} from "../core/guards/auth.guard";
import {PortfolioLanguagesComponent} from "../features/auth/portfolio-languages/portfolio-languages.component";
import {portfolioLanguagesResolverResolver} from "../core/resolvers/portfolio-languages-resolver.resolver";
import {
  CreateWorkExperienceComponent
} from "../features/work-experiences/create-work-experience/create-work-experience.component";

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
        path:'portfolio/work-experiences',
        component : WorkExperienceComponent,
        canActivate: [authGuard]
      },
      {
        path: 'portfolio/work-experiences/create',
        component: CreateWorkExperienceComponent,
        canActivate: [authGuard]
      }

      ]
  },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
];
