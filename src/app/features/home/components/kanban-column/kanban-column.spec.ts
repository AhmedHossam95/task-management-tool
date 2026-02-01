import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { KanbanColumnComponent } from './kanban-column';
import { Task } from '../../models/tasks.model';

@Component({
  template: `
    <app-kanban-column
      [columnId]="columnId()"
      [connectedTo]="connectedTo()"
      [count]="count()"
      [dragEnabled]="dragEnabled()"
      [tasks]="tasks()"
      [title]="title()"
      (taskClick)="onTaskClick($event)"
      (taskDropped)="onTaskDropped($event)"
    />
  `,
  standalone: true,
  imports: [KanbanColumnComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  readonly title = signal('To Do');
  readonly tasks = signal<Task[]>([]);
  readonly count = signal(0);
  readonly columnId = signal('todo');
  readonly connectedTo = signal(['in-progress', 'done']);
  readonly dragEnabled = signal(true);
  droppedEvent: CdkDragDrop<Task[]> | null = null;
  clickedTask: Task | null = null;

  onTaskDropped(event: CdkDragDrop<Task[]>): void {
    this.droppedEvent = event;
  }

  onTaskClick(task: Task): void {
    this.clickedTask = task;
  }
}

describe('KanbanColumnComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'todo',
      priority: 'high',
      order: 0,
      assignee: { id: 'u1', name: 'Alice', avatar: '', email: 'alice@test.com' },
      dueDate: '2026-02-15',
      tags: ['bug'],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: 'todo',
      priority: 'medium',
      order: 1,
      assignee: { id: 'u2', name: 'Bob', avatar: '', email: 'bob@test.com' },
      dueDate: '2026-02-20',
      tags: ['feature'],
      createdAt: '2026-01-02',
      updatedAt: '2026-01-02',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toBeTruthy();
  });

  it('should display column title', () => {
    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement?.textContent).toContain('To Do');
  });

  it('should update title when input changes', () => {
    host.title.set('In Progress');
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement?.textContent).toContain('In Progress');
  });

  it('should display task count', () => {
    host.count.set(5);
    fixture.detectChanges();

    const countElement = fixture.nativeElement.querySelector('.kanban-column-count');
    expect(countElement?.textContent?.trim()).toBe('5');
  });

  it('should update count when input changes', () => {
    host.count.set(10);
    fixture.detectChanges();

    const countElement = fixture.nativeElement.querySelector('.kanban-column-count');
    expect(countElement?.textContent?.trim()).toBe('10');
  });

  it('should render tasks', () => {
    host.tasks.set(mockTasks);
    host.count.set(mockTasks.length);
    fixture.detectChanges();

    const taskElements = fixture.nativeElement.querySelectorAll('app-task');
    expect(taskElements.length).toBe(2);
  });

  it('should show "No tasks" message when empty', () => {
    host.tasks.set([]);
    host.count.set(0);
    fixture.detectChanges();

    const emptyMessage = fixture.nativeElement.querySelector('.kanban-column-content p');
    expect(emptyMessage?.textContent).toContain('No tasks');
  });

  it('should have drop list container', () => {
    const dropList = fixture.nativeElement.querySelector('[cdkDropList]');
    expect(dropList).toBeTruthy();
  });

  it('should have correct column structure', () => {
    const column = fixture.nativeElement.querySelector('.kanban-column');
    const header = fixture.nativeElement.querySelector('header');
    const content = fixture.nativeElement.querySelector('.kanban-column-content');

    expect(column).toBeTruthy();
    expect(header).toBeTruthy();
    expect(content).toBeTruthy();
  });

  it('should have drag enabled by default', () => {
    host.tasks.set(mockTasks);
    fixture.detectChanges();

    const draggableItems = fixture.nativeElement.querySelectorAll('[cdkDrag]');
    expect(draggableItems.length).toBe(mockTasks.length);
  });

  it('should pass columnId to drop list', () => {
    host.columnId.set('test-column');
    fixture.detectChanges();

    const dropList = fixture.nativeElement.querySelector('[cdkDropList]');
    expect(dropList?.id).toBe('test-column');
  });

  it('should render single task', () => {
    host.tasks.set([mockTasks[0]]);
    host.count.set(1);
    fixture.detectChanges();

    const taskElements = fixture.nativeElement.querySelectorAll('app-task');
    expect(taskElements.length).toBe(1);
  });

  it('should have header with title and count', () => {
    const header = fixture.nativeElement.querySelector('header');
    const title = header?.querySelector('h2');
    const count = header?.querySelector('.kanban-column-count');

    expect(title).toBeTruthy();
    expect(count).toBeTruthy();
  });

  it('should display zero count', () => {
    host.count.set(0);
    fixture.detectChanges();

    const countElement = fixture.nativeElement.querySelector('.kanban-column-count');
    expect(countElement?.textContent?.trim()).toBe('0');
  });
});
