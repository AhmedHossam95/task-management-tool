import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [ToastService, { provide: MatSnackBar, useValue: snackBarSpy }],
    });

    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should call snackBar.open with correct message', () => {
      service.show('Test message', 'info');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Test message',
        jasmine.any(String),
        jasmine.any(Object),
      );
    });

    it('should use "Dismiss" as default action', () => {
      service.show('Test message', 'info');

      expect(snackBarSpy.open).toHaveBeenCalledWith('Test message', 'Dismiss', jasmine.any(Object));
    });

    it('should use custom action when provided', () => {
      service.show('Test message', 'info', 'OK');

      expect(snackBarSpy.open).toHaveBeenCalledWith('Test message', 'OK', jasmine.any(Object));
    });

    it('should set duration to 4000ms', () => {
      service.show('Test message', 'info');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(String),
        jasmine.objectContaining({ duration: 4000 }),
      );
    });

    it('should set horizontalPosition to end', () => {
      service.show('Test message', 'info');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(String),
        jasmine.objectContaining({ horizontalPosition: 'end' }),
      );
    });

    it('should set verticalPosition to top', () => {
      service.show('Test message', 'info');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(String),
        jasmine.objectContaining({ verticalPosition: 'top' }),
      );
    });

    it('should set panelClass based on type', () => {
      service.show('Test message', 'success');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(String),
        jasmine.objectContaining({ panelClass: ['toast-success'] }),
      );
    });
  });

  describe('success', () => {
    it('should call show with success type', () => {
      service.success('Success!');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Success!',
        'Dismiss',
        jasmine.objectContaining({ panelClass: ['toast-success'] }),
      );
    });
  });

  describe('error', () => {
    it('should call show with error type', () => {
      service.error('Error!');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Error!',
        'Dismiss',
        jasmine.objectContaining({ panelClass: ['toast-error'] }),
      );
    });

    it('should accept custom action', () => {
      service.error('Error!', 'Retry');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Error!',
        'Retry',
        jasmine.objectContaining({ panelClass: ['toast-error'] }),
      );
    });
  });

  describe('info', () => {
    it('should call show with info type', () => {
      service.info('Info message');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Info message',
        'Dismiss',
        jasmine.objectContaining({ panelClass: ['toast-info'] }),
      );
    });
  });

  describe('warning', () => {
    it('should call show with warning type', () => {
      service.warning('Warning!');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Warning!',
        'Dismiss',
        jasmine.objectContaining({ panelClass: ['toast-warning'] }),
      );
    });
  });
});
