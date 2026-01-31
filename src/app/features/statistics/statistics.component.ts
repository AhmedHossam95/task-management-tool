import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StatisticsService } from './services/statistics.service';
import { StatCardComponent } from './components/stat-card/stat-card.component';

@Component({
  selector: 'app-statistics',
  imports: [StatCardComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent {
  private readonly statisticsService = inject(StatisticsService);

  protected readonly statistics = this.statisticsService.statistics;
}
