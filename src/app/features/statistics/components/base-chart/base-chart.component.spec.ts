import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BaseChartComponent } from './base-chart.component';
import { ArcElement, Chart, DoughnutController, Legend, PieController, Tooltip } from 'chart.js';

// Register Chart.js components
Chart.register(PieController, DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  template: `
    <app-base-chart
      [chartType]="chartType()"
      [colors]="colors()"
      [data]="data()"
      [isEmpty]="isEmpty()"
      [isLoading]="isLoading()"
      [labels]="labels()"
      [title]="title()"
    />
  `,
  standalone: true,
  imports: [BaseChartComponent],
})
class TestHostComponent {
  readonly title = signal('Test Chart');
  readonly chartType = signal<'pie' | 'doughnut'>('pie');
  readonly labels = signal(['A', 'B', 'C']);
  readonly data = signal([10, 20, 30]);
  readonly colors = signal(['#ff0000', '#00ff00', '#0000ff']);
  readonly isLoading = signal(false);
  readonly isEmpty = signal(false);
}

describe('BaseChartComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toBeTruthy();
  });

  it('should display title in card header', () => {
    const titleElement = fixture.nativeElement.querySelector('mat-card-title');
    expect(titleElement?.textContent).toContain('Test Chart');
  });

  it('should update title when input changes', () => {
    host.title.set('Updated Chart Title');
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('mat-card-title');
    expect(titleElement?.textContent).toContain('Updated Chart Title');
  });

  it('should show loading spinner when isLoading is true', () => {
    host.isLoading.set(true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should hide chart when loading', () => {
    host.isLoading.set(true);
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeFalsy();
  });

  it('should show empty state when isEmpty is true', () => {
    host.isEmpty.set(true);
    fixture.detectChanges();

    const emptyContainer = fixture.nativeElement.querySelector('.empty-container');
    expect(emptyContainer).toBeTruthy();
    expect(emptyContainer?.textContent).toContain('No tasks to display');
  });

  it('should hide chart when empty', () => {
    host.isEmpty.set(true);
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeFalsy();
  });

  it('should render chart canvas when not loading and not empty', () => {
    host.isLoading.set(false);
    host.isEmpty.set(false);
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should not show spinner when not loading', () => {
    host.isLoading.set(false);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeFalsy();
  });

  it('should not show empty state when not empty', () => {
    host.isEmpty.set(false);
    fixture.detectChanges();

    const emptyContainer = fixture.nativeElement.querySelector('.empty-container');
    expect(emptyContainer).toBeFalsy();
  });

  it('should support pie chart type', () => {
    host.chartType.set('pie');
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should support doughnut chart type', () => {
    host.chartType.set('doughnut');
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should have chart container', () => {
    const chartContainer = fixture.nativeElement.querySelector('.chart-container');
    expect(chartContainer).toBeTruthy();
  });

  it('should have mat-card structure', () => {
    const card = fixture.nativeElement.querySelector('mat-card');
    const cardHeader = fixture.nativeElement.querySelector('mat-card-header');
    const cardContent = fixture.nativeElement.querySelector('mat-card-content');

    expect(card).toBeTruthy();
    expect(cardHeader).toBeTruthy();
    expect(cardContent).toBeTruthy();
  });

  it('should show loading state before empty state', () => {
    host.isLoading.set(true);
    host.isEmpty.set(true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    const emptyContainer = fixture.nativeElement.querySelector('.empty-container');

    expect(spinner).toBeTruthy();
    expect(emptyContainer).toBeFalsy();
  });
});
