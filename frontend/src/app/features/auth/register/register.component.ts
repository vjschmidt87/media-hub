import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/i18n/translation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-icon">🎬</span>
          <h1>{{ t.t('auth.register') }}</h1>
          <p>Media Hub</p>
        </div>

        @if (errorMessage) {
          <div class="error-alert">{{ errorMessage }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">{{ t.t('auth.username') }}</label>
            <input
              class="form-input"
              type="text"
              [(ngModel)]="username"
              name="username"
              [placeholder]="t.t('auth.username')"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t.t('auth.email') }}</label>
            <input
              class="form-input"
              type="email"
              [(ngModel)]="email"
              name="email"
              [placeholder]="t.t('auth.email')"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t.t('auth.password') }}</label>
            <input
              class="form-input"
              type="password"
              [(ngModel)]="password"
              name="password"
              [placeholder]="t.t('auth.password')"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="isLoading">
            {{ isLoading ? t.t('loading.default') : t.t('auth.registerBtn') }}
          </button>
        </form>

        <p class="auth-hint">
          {{ t.t('auth.hasAccount') }}
          <a routerLink="/login">{{ t.t('auth.signIn') }}</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly t = inject(TranslationService);

  username = '';
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  onSubmit(): void {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/search']),
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}
