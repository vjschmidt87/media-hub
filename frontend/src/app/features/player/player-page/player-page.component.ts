import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslationService } from '@core/i18n/translation.service';
import { StreamService } from '@core/services/stream.service';

@Component({
  selector: 'app-player-page',
  standalone: true,
  imports: [],
  template: `
    <div class="player-page">
      <div class="player-header">
        <button class="back-btn" (click)="goBack()">{{ t.t('player.back') }}</button>
        <h1 class="player-title">
          ▶ {{ title() }}
          @if (episode()) { <span class="ep-label"> — {{ episode() }}</span> }
        </h1>
        @if (src()) {
          <a class="external-link" [href]="src()" target="_blank" rel="noopener">
            🔗 {{ t.t('player.openExternal') }}
          </a>
        }
      </div>

      <div class="notice-banner">
        ℹ️ {{ t.t('player.notice') }}
      </div>

      <div class="player-container">
        @if (resolving()) {
          <div class="player-loading">
            <div class="spinner"></div>
            <p>{{ t.t('player.resolving') }}</p>
          </div>
        } @else if (sanitizedUrl()) {
          <iframe
            class="player-iframe"
            [src]="sanitizedUrl()!"
            allowfullscreen
            allow="fullscreen; autoplay"
            scrolling="no"
          ></iframe>
        } @else {
          <div class="no-source">
            <span>🚫</span>
            <p>{{ t.t('player.blocked') }}</p>
            @if (src()) {
              <a class="btn btn-primary" [href]="src()" target="_blank" rel="noopener">
                {{ t.t('player.openExternal') }}
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './player-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPageComponent implements OnInit {
  readonly t = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly streamService = inject(StreamService);

  readonly src = signal<string | null>(null);
  readonly title = signal('');
  readonly episode = signal('');
  readonly resolving = signal(false);
  readonly sanitizedUrl = signal<SafeResourceUrl | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const s = params.get('src');
      this.title.set(params.get('title') ?? '');
      this.episode.set(params.get('episode') ?? '');
      this.src.set(s);
      this.sanitizedUrl.set(null);

      if (!s) return;

      // If the src looks like a real URL, try to resolve the embed player from it
      if (s.startsWith('http')) {
        this.resolving.set(true);
        this.streamService.resolve(s).subscribe({
          next: (res) => {
            const url = res.streamUrl || s;
            this.sanitizedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
            this.resolving.set(false);
          },
          error: () => {
            // Fallback: try to embed the episode page directly
            this.sanitizedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(s));
            this.resolving.set(false);
          },
        });
      } else {
        // Not a real URL (e.g. old placeholder data) — show blocked state
        this.resolving.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }
}
