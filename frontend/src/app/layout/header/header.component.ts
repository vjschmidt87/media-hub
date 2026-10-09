import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService, Lang } from '@core/i18n/translation.service';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    <header class="header">
      <div class="header-inner">
        <a routerLink="/search" class="logo">
          <span class="logo-icon">🎬</span>
          <span class="logo-text">{{ t.t('header.logo') }}</span>
        </a>

        <nav class="nav" [class.open]="menuOpen">
          <a routerLink="/search" routerLinkActive="active" class="nav-link">
            {{ t.t('header.search') }}
          </a>
          <a routerLink="/watchlist" routerLinkActive="active" class="nav-link">
            {{ t.t('header.watchlist') }}
          </a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="nav-link nav-link--admin">
              {{ t.t('header.admin') }}
            </a>
          }
        </nav>

        <div class="header-actions">
          <button class="icon-btn" (click)="theme.toggle()" [title]="theme.isDark() ? t.t('header.lightMode') : t.t('header.darkMode')">
            {{ theme.isDark() ? '☀️' : '🌙' }}
          </button>

          <button class="lang-toggle" (click)="toggleLang()" [title]="t.currentLang() === 'en' ? 'Mudar para Português' : 'Switch to English'">
            {{ t.currentLang() === 'en' ? 'PT-BR' : 'EN' }}
          </button>

          @if (auth.currentUser$ | async; as user) {
            <span class="username">{{ user.username }}</span>
            <button class="btn-logout" (click)="logout()">{{ t.t('header.logout') }}</button>
          }
        </div>

        <button class="hamburger" (click)="menuOpen = !menuOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  `,
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly t = inject(TranslationService);
  readonly theme = inject(ThemeService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  menuOpen = false;

  toggleLang(): void {
    const next: Lang = this.t.currentLang() === 'en' ? 'pt-br' : 'en';
    this.t.setLang(next);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
