import {Component, Input} from '@angular/core';
import {Router} from "@angular/router";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-desktop-nav',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './desktop-nav.component.html',
  styleUrl: './desktop-nav.component.css'
})
export class DesktopNavComponent {

  @Input() public theme: string = 'auto';

  public constructor(private router: Router) {
  }

  logout(){
    localStorage.clear()
    this.router.navigate(['/']).then(r => console.log(r));
  }
}
