import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/i18n/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-icon">🎬</span>
          <h1>{{ t.t('auth.login') }}</h1>
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
              autocomplete="username"
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
              autocomplete="current-password"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="isLoading">
            {{ isLoading ? t.t('loading.default') : t.t('auth.loginBtn') }}
          </button>
        </form>

        <p class="auth-hint">
          {{ t.t('auth.noAccount') }}
          <a routerLink="/register">{{ t.t('auth.signUp') }}</a>
        </p>

        <p class="admin-hint"><em>{{ t.t('auth.adminHint') }}</em></p>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly t = inject(TranslationService);

  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/search']),
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid username or password.';
      },
    });
  }
}
