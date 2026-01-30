import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDrawerMode, MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MediaMatcher } from '@angular/cdk/layout';
import { TitleCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { SIDENAV_ROUTES } from './shared/constants/sidenav.constants';
import { Route } from './shared/models/sidenav.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    TitleCasePipe,
    RouterLinkActive,
    RouterLink,
    HeaderComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly mediaMatcher = inject(MediaMatcher);
  private readonly smallScreenQuery = this.mediaMatcher.matchMedia('(max-width: 1024px)');
  protected readonly navList = signal<Route[]>([...SIDENAV_ROUTES]).asReadonly();
  protected readonly isSmallScreen = signal(this.smallScreenQuery.matches);
  protected readonly sideNavMode = computed<MatDrawerMode>(() =>
    this.isSmallScreen() ? 'over' : 'side',
  );

  ngOnInit(): void {
    this.addMediaQueryListener();
  }

  ngOnDestroy(): void {
    this.removeMediaQueryListener();
  }

  private addMediaQueryListener(): void {
    this.smallScreenQuery.addEventListener('change', (event) => {
      this.isSmallScreen.set(event.matches);
    });
  }

  private removeMediaQueryListener(): void {
    this.smallScreenQuery.removeEventListener('change', (event) => {
      this.isSmallScreen.set(event.matches);
    });
  }

  protected dismissSideNavOnMobile(sideNav: MatSidenav): void {
    if (this.isSmallScreen()) {
      sideNav.close();
    }
  }
}
