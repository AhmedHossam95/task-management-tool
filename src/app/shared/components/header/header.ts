import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgOptimizedImage } from '@angular/common';
import { CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, NgOptimizedImage],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly isSmallScreen = input<boolean>(false);
  protected readonly toggleSidenav = output<void>();
  protected readonly logo = 'assets/icons/logo.png';
  protected readonly title = 'Taskito';

  private readonly cacheService = inject(CacheService);

  // Expose hasNewData from cache service to template
  protected readonly hasNewData = this.cacheService.hasNewData;

  /**
   * Apply pending updates when user clicks refresh button
   */
  protected onRefresh(): void {
    this.cacheService.applyPendingUpdates();
  }
}
