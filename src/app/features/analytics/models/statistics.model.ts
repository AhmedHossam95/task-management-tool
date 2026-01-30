export type ChangeType = 'positive' | 'negative' | 'neutral';

export type Statistic = {
  id: string;
  title: string;
  icon: string;
  value: number;
  change: string;
  changeLabel: string;
  changeType: ChangeType;
  color: string;
};

export type StatisticsResponse = {
  statistics: Statistic[];
  lastUpdated: string;
};
