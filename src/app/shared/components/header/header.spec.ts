import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HeaderComponent } from './header';
import { CacheService } from '../../services/cache.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let cacheService: CacheService;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [CacheService],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    cacheService = TestBed.inject(CacheService);
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('refresh button visibility', () => {
    it('should not display refresh button when no new data is available', () => {
      fixture.detectChanges();

      const refreshButton = debugElement.query(By.css('.refresh-btn'));
      expect(refreshButton).toBeNull();
    });

    it('should display refresh button when new data is available', () => {
      // Set pending data to simulate new data available
      cacheService.setPending('/api/tasks', [{ id: 1 }]);
      fixture.detectChanges();

      const refreshButton = debugElement.query(By.css('.refresh-btn'));
      expect(refreshButton).toBeTruthy();
    });

    it('should update button visibility when hasNewData changes', () => {
      // Initially no data
      fixture.detectChanges();
      let refreshButton = debugElement.query(By.css('.refresh-btn'));
      expect(refreshButton).toBeNull();

      // Add pending data
      cacheService.setPending('/api/tasks', [{ id: 1 }]);
      fixture.detectChanges();
      refreshButton = debugElement.query(By.css('.refresh-btn'));
      expect(refreshButton).toBeTruthy();

      // Clear pending data
      cacheService.clearPendingUpdates();
      fixture.detectChanges();
      refreshButton = debugElement.query(By.css('.refresh-btn'));
      expect(refreshButton).toBeNull();
    });
  });

  describe('refresh button interaction', () => {
    it('should apply pending updates when refresh button is clicked', () => {
      spyOn(cacheService, 'applyPendingUpdates').and.callThrough();

      // Set up pending data
      cacheService.setPending('/api/tasks', [{ id: 1 }]);
      fixture.detectChanges();

      // Find and click refresh button
      const refreshButton = debugElement.query(By.css('.refresh-btn'));
      expect(refreshButton).toBeTruthy();

      refreshButton.nativeElement.click();

      expect(cacheService.applyPendingUpdates).toHaveBeenCalled();
    });

    it('should clear pending updates after clicking refresh', () => {
      cacheService.setPending('/api/tasks', [{ id: 1 }]);
      expect(cacheService.hasNewData()).toBe(true);

      fixture.detectChanges();
      const refreshButton = debugElement.query(By.css('.refresh-btn'));
      refreshButton.nativeElement.click();

      expect(cacheService.pendingUpdates().size).toBe(0);
      expect(cacheService.hasNewData()).toBe(false);
    });
  });

  describe('sidenav toggle', () => {
    it('should emit toggleSidenav event when menu button clicked on small screen', () => {
      // Set small screen using componentRef.setInput
      fixture.componentRef.setInput('isSmallScreen', true);
      fixture.detectChanges();

      let emitted = false;
      // Access protected output using bracket notation and subscribe
      component['toggleSidenav'].subscribe(() => {
        emitted = true;
      });

      const menuButton = debugElement.query(By.css('[aria-label="Toggle sidenav"]'));
      expect(menuButton).toBeTruthy();

      menuButton.nativeElement.click();
      expect(emitted).toBe(true);
    });

    it('should not show menu button on large screen', () => {
      // Set large screen using componentRef.setInput
      fixture.componentRef.setInput('isSmallScreen', false);
      fixture.detectChanges();

      const menuButton = debugElement.query(By.css('[aria-label="Toggle sidenav"]'));
      expect(menuButton).toBeNull();
    });
  });

  describe('component rendering', () => {
    it('should display the app title', () => {
      fixture.detectChanges();

      const title = debugElement.query(By.css('.fs-lg.fc-primary'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Taskito');
    });

    it('should display logo on large screen', () => {
      fixture.componentRef.setInput('isSmallScreen', false);
      fixture.detectChanges();

      const logo = debugElement.query(By.css('.logo'));
      expect(logo).toBeTruthy();
    });
  });
});
