import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormFooterComponent } from './task-form-footer';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TaskFormFooterComponent', () => {
  let component: TaskFormFooterComponent;
  let fixture: ComponentFixture<TaskFormFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormFooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormFooterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Button rendering', () => {
    it('should render cancel and save buttons', () => {
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const cancelButton = buttons.find((btn) => btn.nativeElement.textContent.trim() === 'Cancel');
      const saveButton = buttons.find((btn) => btn.nativeElement.textContent.trim() === 'Save');

      expect(cancelButton).toBeTruthy();
      expect(saveButton).toBeTruthy();
    });

    it('should not show delete button when isEditMode is false', () => {
      fixture.componentRef.setInput('isEditMode', false);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));

      expect(deleteButton).toBeNull();
    });

    it('should show delete button when isEditMode is true', () => {
      fixture.componentRef.setInput('isEditMode', true);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));

      expect(deleteButton).toBeTruthy();
      expect(deleteButton.nativeElement.textContent).toContain('Delete');
    });

    it('should render delete button with delete icon', () => {
      fixture.componentRef.setInput('isEditMode', true);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
      const icon = deleteButton.query(By.css('mat-icon'));

      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent.trim()).toBe('delete');
    });

    it('should render save button with primary color', () => {
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const saveButton = buttons.find((btn) => btn.nativeElement.textContent.trim() === 'Save');

      expect(saveButton?.nativeElement.getAttribute('color')).toBe('primary');
    });

    it('should render save button as submit type', () => {
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const saveButton = buttons.find((btn) => btn.nativeElement.textContent.trim() === 'Save');

      expect(saveButton?.nativeElement.getAttribute('type')).toBe('submit');
    });
  });

  describe('Event emissions', () => {
    it('should emit deleteClick when delete button is clicked', () => {
      fixture.componentRef.setInput('isEditMode', true);
      fixture.detectChanges();

      let emitted = false;
      component.deleteClick.subscribe(() => {
        emitted = true;
      });

      const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
      deleteButton.nativeElement.click();

      expect(emitted).toBe(true);
    });

    it('should emit cancelClick when cancel button is clicked', () => {
      fixture.detectChanges();

      let emitted = false;
      component.cancelClick.subscribe(() => {
        emitted = true;
      });

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const cancelButton = buttons.find((btn) => btn.nativeElement.textContent.trim() === 'Cancel');
      cancelButton?.nativeElement.click();

      expect(emitted).toBe(true);
    });

    it('should not emit deleteClick when delete button is not rendered', () => {
      fixture.componentRef.setInput('isEditMode', false);
      fixture.detectChanges();

      let emitted = false;
      component.deleteClick.subscribe(() => {
        emitted = true;
      });

      const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));

      expect(deleteButton).toBeNull();
      expect(emitted).toBe(false);
    });
  });

  describe('Component inputs', () => {
    it('should have isEditMode input with default false', () => {
      expect(component.isEditMode()).toBe(false);
    });

    it('should update isEditMode input', () => {
      fixture.componentRef.setInput('isEditMode', true);
      fixture.detectChanges();

      expect(component.isEditMode()).toBe(true);
    });

    it('should toggle delete button visibility when isEditMode changes', () => {
      // Start with false
      fixture.componentRef.setInput('isEditMode', false);
      fixture.detectChanges();
      let deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
      expect(deleteButton).toBeNull();

      // Change to true
      fixture.componentRef.setInput('isEditMode', true);
      fixture.detectChanges();
      deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
      expect(deleteButton).toBeTruthy();

      // Change back to false
      fixture.componentRef.setInput('isEditMode', false);
      fixture.detectChanges();
      deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
      expect(deleteButton).toBeNull();
    });
  });

  describe('Button types', () => {
    it('should have cancel button as type button', () => {
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const cancelButton = buttons.find((btn) => btn.nativeElement.textContent.trim() === 'Cancel');

      expect(cancelButton?.nativeElement.getAttribute('type')).toBe('button');
    });

    it('should have delete button as type button', () => {
      fixture.componentRef.setInput('isEditMode', true);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));

      expect(deleteButton.nativeElement.getAttribute('type')).toBe('button');
    });
  });
});
