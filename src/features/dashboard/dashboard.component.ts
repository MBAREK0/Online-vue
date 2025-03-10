import {Component, AfterViewInit, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterOutlet} from "@angular/router";
import {AsideComponent} from "../../shared/components/aside/aside.component";
import {DesktopNavComponent} from "../../shared/components/desktop-nav/desktop-nav.component";
import {Store} from "@ngrx/store";
import {AppState} from "../../shared/state/app.reducer";
import {reset_app_state} from "../../shared/state/app.actions"; // Import CommonModule


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, AsideComponent, DesktopNavComponent]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  theme: string = 'auto'; // Default theme

  ngOnInit(): void {
    // Maintain the original layout style from localStorage
    this.setFluidLayout();
    this.setNavbarStyle();
    // Check the theme from localStorage or default to 'auto'
    this.theme = localStorage.getItem('theme') || 'auto';
  }



  ngAfterViewInit(): void {
    // Manage navbar positioning after the view is initialized
    this.setNavbarPosition();
  }

  private setFluidLayout(): void {
    const isFluid = JSON.parse(localStorage.getItem('isFluid') || 'false');
    const container = document.querySelector('[data-layout]') as HTMLElement;
    if (isFluid && container) {
      container.classList.remove('container');
      container.classList.add('container-fluid');
    } else if (container) {
      container.classList.add('container');
      container.classList.remove('container-fluid');
    }
  }

  private setNavbarStyle(): void {
    const navbarStyle = localStorage.getItem('navbarStyle');
    const navbar = document.querySelector('.navbar-vertical') as HTMLElement;
    if (navbar && navbarStyle && navbarStyle !== 'transparent') {
      navbar.classList.add(`navbar-${navbarStyle}`);
    }
  }

  private setNavbarPosition(): void {
    const navbarPosition = localStorage.getItem('navbarPosition');
    const navbarVertical = document.querySelector('.navbar-vertical') as HTMLElement;
    const navbarTopVertical = document.querySelector('.content .navbar-top') as HTMLElement;
    const navbarTop = document.querySelector(
      '[data-layout] .navbar-top:not([data-double-top-nav])'
    ) as HTMLElement;
    const navbarDoubleTop = document.querySelector('[data-double-top-nav]') as HTMLElement;
    const navbarTopCombo = document.querySelector(
      '.content [data-navbar-top="combo"]'
    ) as HTMLElement;

    switch (navbarPosition) {
      case 'top':
        navbarTop?.removeAttribute('style');
        navbarTopVertical?.remove();
        navbarVertical?.remove();
        navbarTopCombo?.remove();
        navbarDoubleTop?.remove();
        break;
      case 'combo':
        navbarVertical?.removeAttribute('style');
        navbarTopCombo?.removeAttribute('style');
        navbarTop?.remove();
        navbarTopVertical?.remove();
        navbarDoubleTop?.remove();
        break;
      case 'double-top':
        navbarDoubleTop?.removeAttribute('style');
        navbarTopVertical?.remove();
        navbarVertical?.remove();
        navbarTop?.remove();
        navbarTopCombo?.remove();
        break;
      default:
        navbarVertical?.removeAttribute('style');
        navbarTopVertical?.removeAttribute('style');
        navbarTop?.remove();
        navbarDoubleTop?.remove();
        navbarTopCombo?.remove();
    }

  }
  constructor(private router: Router,private store: Store<AppState> ) {}


  logout() {
    localStorage.clear();
    this.store.dispatch(reset_app_state());

    this.router.navigate(['/auth/login']).then(success => console.log(success));
  }
}
