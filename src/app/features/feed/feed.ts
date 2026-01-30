import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-feed',
  imports: [],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent {}
