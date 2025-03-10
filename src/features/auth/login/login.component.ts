import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {JwtService} from "../../../core/services/jwt.service";
import {load_portfolio_languages} from "../../../shared/state/app.actions";
import {Store} from "@ngrx/store";
import {AppState} from "../../../shared/state/app.reducer";
import {selectPortfolioLanguages} from "../../../shared/state/app.selectors";
import {filter, take} from "rxjs";


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    NgOptimizedImage
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  serverErrorMessage: string | null = null;
  private store = inject(Store<AppState>);


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router,private jwtService: JwtService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['',Validators.required]
    });
  }



  onSubmit(): void {
    if (this.loginForm.valid) {

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // save the token in local storage
          localStorage.setItem('token', response.token);

          const username = <string>this.jwtService.getUsername(response.token)
          const userId = <string>this.jwtService.getUserId(response.token)

          localStorage.setItem('username', username);
          localStorage.setItem('userId', userId);


          this.router.navigate(['/auth/ptl']).then(r => console.log(r));


          this.serverErrorMessage = null;
        },
        error: (err) => {
          this.serverErrorMessage = err.error?.message || 'An error occurred';
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }

}
