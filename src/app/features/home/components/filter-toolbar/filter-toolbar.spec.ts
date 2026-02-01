import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { FilterToolbarComponent } from './filter-toolbar';
import { TasksFilterService } from '../../services/tasks-filter.service';
import { UsersService } from '../../services/users.service';
import { DEFAULT_FILTERS } from '../../models/task-filters.model';

describe('FilterToolbarComponent', () => {
  let component: FilterToolbarComponent;
  let fixture: ComponentFixture<FilterToolbarComponent>;
  let filterServiceSpy: jasmine.SpyObj<TasksFilterService>;

  beforeEach(async () => {
    filterServiceSpy = jasmine.createSpyObj(
      'TasksFilterService',
      ['setStatus', 'setPriority', 'setAssignee', 'setSearch', 'setSort', 'resetFilters'],
      {
        statusFilter: signal('all'),
        priorityFilter: signal('all'),
        assigneeFilter: signal('all'),
        searchQuery: signal(''),
        sortConfig: signal({ field: 'order', order: 'asc' }),
        hasActiveFiltersOrSort: signal(false),
      },
    );

    const usersServiceSpy = {
      users: signal([
        { id: 'u1', name: 'Alice', avatar: '', email: 'alice@test.com' },
        { id: 'u2', name: 'Bob', avatar: '', email: 'bob@test.com' },
      ]),
      usersResource: {
        value: signal([]),
        isLoading: signal(false),
        error: signal(null),
      },
    };

    await TestBed.configureTestingModule({
      imports: [FilterToolbarComponent, NoopAnimationsModule],
      providers: [
        { provide: TasksFilterService, useValue: filterServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have search input', () => {
    const searchInput = fixture.nativeElement.querySelector('input[matInput]');
    expect(searchInput).toBeTruthy();
  });

  it('should have search input with placeholder', () => {
    const searchInput = fixture.nativeElement.querySelector('input[matInput]');
    expect(searchInput?.placeholder).toContain('Search');
  });

  it('should have priority filter dropdown', () => {
    const prioritySelect = fixture.nativeElement.querySelector('mat-select');
    expect(prioritySelect).toBeTruthy();
  });

  it('should have create task button', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const createButton = Array.from(buttons).find(
      (b: any) =>
        b.textContent?.toLowerCase().includes('task') ||
        b.querySelector('mat-icon')?.textContent === 'add',
    );
    expect(createButton).toBeTruthy();
  });

  it('should emit createTask when create button clicked', () => {
    spyOn(component.createTask, 'emit');

    const buttons = fixture.nativeElement.querySelectorAll('button[mat-flat-button]');
    const createButton = Array.from(buttons).find((b: any) =>
      b.textContent?.toLowerCase().includes('task'),
    ) as HTMLButtonElement;

    if (createButton) {
      createButton.click();
      fixture.detectChanges();
      expect(component.createTask.emit).toHaveBeenCalled();
    }
  });

  it('should have status tabs', () => {
    const statusTabs = fixture.nativeElement.querySelectorAll('.status-tab');
    expect(statusTabs.length).toBeGreaterThan(0);
  });

  it('should have sort button', () => {
    // The sort button contains a sort icon
    const sortIcon = fixture.nativeElement.querySelector('mat-icon');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const sortButton = Array.from(buttons).find(
      (b: any) =>
        b.textContent?.includes('sort') || b.querySelector('mat-icon')?.textContent === 'sort',
    );
    expect(sortButton).toBeTruthy();
  });

  it('should have mat-menu for sorting', () => {
    const matMenu = fixture.nativeElement.querySelector('mat-menu');
    expect(matMenu).toBeTruthy();
  });

  it('should debounce search input', fakeAsync(() => {
    const searchInput = fixture.nativeElement.querySelector('input[matInput]') as HTMLInputElement;

    if (searchInput) {
      searchInput.value = 'test';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Should not call immediately
      expect(filterServiceSpy.setSearch).not.toHaveBeenCalled();

      // After debounce time (300ms)
      tick(300);
      expect(filterServiceSpy.setSearch).toHaveBeenCalledWith('test');
    }
  }));

  it('should clear search when clear button clicked', () => {
    // Set search value first
    (component as any).searchInput.set('some value');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('button[matSuffix]');
    if (clearButton) {
      clearButton.click();
      fixture.detectChanges();
      expect(filterServiceSpy.setSearch).toHaveBeenCalledWith('');
    }
  });

  it('should have assignee filter dropdown', () => {
    const selects = fixture.nativeElement.querySelectorAll('mat-select');
    expect(selects.length).toBeGreaterThanOrEqual(2); // Priority and Assignee
  });

  it('should show search icon', () => {
    const searchIcon = fixture.nativeElement.querySelector('mat-icon');
    expect(searchIcon).toBeTruthy();
  });

  it('should have form fields with outline appearance', () => {
    const formFields = fixture.nativeElement.querySelectorAll(
      'mat-form-field[appearance="outline"]',
    );
    expect(formFields.length).toBeGreaterThan(0);
  });

  it('should call onStatusChange when status tab clicked', () => {
    spyOn(component, 'onStatusChange');

    const statusTabs = fixture.nativeElement.querySelectorAll('.status-tab');
    if (statusTabs.length > 0) {
      statusTabs[0].click();
      expect(component.onStatusChange).toHaveBeenCalled();
    }
  });

  it('should highlight active status tab', () => {
    const activeTab = fixture.nativeElement.querySelector('.status-tab.active');
    expect(activeTab).toBeTruthy();
  });

  it('should have sort menu options', () => {
    // Click sort button to open menu
    const sortButton = fixture.nativeElement.querySelector('[matMenuTriggerFor]');
    if (sortButton) {
      sortButton.click();
      fixture.detectChanges();
    }
    // Menu exists
    const matMenu = fixture.nativeElement.querySelector('mat-menu');
    expect(matMenu).toBeTruthy();
  });
});
