import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZodError, ZodIssue } from 'zod';
import { OrderStatus } from '../../api-services-v2';
import { DriverJsTourService } from '../../services/driver.js-tour.service';
import { ToastInvalidOrderComponent } from './toast-invalid-order.component';

describe('ToastInvalidOrderComponent', () => {
  let component: ToastInvalidOrderComponent;
  let fixture: ComponentFixture<ToastInvalidOrderComponent>;
  let driverJsService: jasmine.SpyObj<DriverJsTourService>;

  beforeEach(async () => {
    const driverJsServiceSpy = jasmine.createSpyObj('DriverJsTourService', ['highlightElement']);

    await TestBed.configureTestingModule({
      imports: [ToastInvalidOrderComponent],
      providers: [{ provide: DriverJsTourService, useValue: driverJsServiceSpy }],
    }).compileComponents();

    driverJsService = TestBed.inject(DriverJsTourService) as jasmine.SpyObj<DriverJsTourService>;

    fixture = TestBed.createComponent(ToastInvalidOrderComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('targetState', OrderStatus.COMPLETED);
    fixture.componentRef.setInput('zodError', new ZodError([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('targetState input transformation', () => {
    it('should transform OrderStatus.COMPLETED to display name', () => {
      fixture.componentRef.setInput('targetState', OrderStatus.COMPLETED);
      fixture.detectChanges();

      expect(component.targetState()).toBe('Fertiggestellt');
    });

    it('should transform OrderStatus.IN_PROGRESS to display name', () => {
      fixture.componentRef.setInput('targetState', OrderStatus.IN_PROGRESS);
      fixture.detectChanges();

      expect(component.targetState()).toBe('In\u00A0Bearbeitung');
    });

    it('should transform OrderStatus.APPROVED to display name', () => {
      fixture.componentRef.setInput('targetState', OrderStatus.APPROVED);
      fixture.detectChanges();

      expect(component.targetState()).toBe('Genehmigt');
    });

    it('should return "Unbekannter Status" for undefined status', () => {
      fixture.componentRef.setInput('targetState', undefined);
      fixture.detectChanges();

      expect(component.targetState()).toBe('Unbekannter Status');
    });

    it('should return "Unbekannter Status" for unknown status string', () => {
      fixture.componentRef.setInput('targetState', 'UNKNOWN_STATUS' as OrderStatus);
      fixture.detectChanges();

      expect(component.targetState()).toBe('Unbekannter Status');
    });
  });

  describe('zodError input transformation', () => {
    it('should transform empty ZodError to empty array', () => {
      const emptyError = new ZodError([]);
      fixture.componentRef.setInput('zodError', emptyError);
      fixture.detectChanges();

      expect(component.zodError()).toEqual([]);
    });

    it('should transform ZodError with single issue to ToastError array', () => {
      const issues: ZodIssue[] = [
        {
          code: 'custom',
          path: ['supplier_id'],
          message: 'Supplier is required',
        },
      ];
      const zodError = new ZodError(issues);
      fixture.componentRef.setInput('zodError', zodError);
      fixture.detectChanges();

      const result = component.zodError();
      expect(result.length).toBe(1);
      expect(result[0].fieldName).toBe('supplier_id');
      expect(result[0].fieldDisplayName).toBe('Lieferant');
      expect(result[0].message).toBe('Supplier is required');
    });

    it('should transform ZodError with multiple issues to ToastError array', () => {
      const issues: ZodIssue[] = [
        {
          code: 'custom',
          path: ['supplier_id'],
          message: 'Supplier is required',
        },
        {
          code: 'custom',
          path: ['primary_cost_center_id'],
          message: 'Cost center is required',
        },
      ];
      const zodError = new ZodError(issues);
      fixture.componentRef.setInput('zodError', zodError);
      fixture.detectChanges();

      const result = component.zodError();
      expect(result.length).toBe(2);
      expect(result[0].fieldName).toBe('supplier_id');
      expect(result[0].fieldDisplayName).toBe('Lieferant');
      expect(result[1].fieldName).toBe('primary_cost_center_id');
      expect(result[1].fieldDisplayName).toBe('Kostenstelle');
    });

    it('should use field name as display name for unmapped fields', () => {
      const issues: ZodIssue[] = [
        {
          code: 'custom',
          path: ['unknown_field'],
          message: 'Field error',
        },
      ];
      const zodError = new ZodError(issues);
      fixture.componentRef.setInput('zodError', zodError);
      fixture.detectChanges();

      const result = component.zodError();
      expect(result.length).toBe(1);
      expect(result[0].fieldName).toBe('unknown_field');
      expect(result[0].fieldDisplayName).toBe('unknown_field');
    });

    it('should handle ZodError with empty path', () => {
      const issues: ZodIssue[] = [
        {
          code: 'custom',
          path: [],
          message: 'General error',
        },
      ];
      const zodError = new ZodError(issues);
      fixture.componentRef.setInput('zodError', zodError);
      fixture.detectChanges();

      const result = component.zodError();
      expect(result.length).toBe(1);
      expect(result[0].fieldName).toBe('unbekanntes_feld');
      expect(result[0].fieldDisplayName).toBe('unbekanntes_feld');
    });

    it('should handle ZodError with nested path', () => {
      const issues: ZodIssue[] = [
        {
          code: 'custom',
          path: ['address', 'street', 'name'],
          message: 'Street name is invalid',
        },
      ];
      const zodError = new ZodError(issues);
      fixture.componentRef.setInput('zodError', zodError);
      fixture.detectChanges();

      const result = component.zodError();
      expect(result.length).toBe(1);
      expect(result[0].fieldName).toBe('name');
      expect(result[0].message).toBe('Street name is invalid');
    });
  });

  describe('highlightField()', () => {
    beforeEach(() => {
      // Create a mock element in the DOM
      const mockElement = document.createElement('div');
      mockElement.className = 'order-field-supplier_id';
      document.body.appendChild(mockElement);
    });

    afterEach(() => {
      // Clean up the mock element
      const mockElement = document.querySelector('.order-field-supplier_id');
      if (mockElement) {
        mockElement.remove();
      }
    });

    it('should call highlightElement when valid field exists in DOM', () => {
      const error = {
        fieldName: 'supplier_id',
        fieldDisplayName: 'Lieferant',
        message: 'Supplier is required',
      };

      component.highlightField(error);

      expect(driverJsService.highlightElement).toHaveBeenCalledWith(
        '.order-field-supplier_id',
        'Fehler beim Statuswechsel',
        'Supplier is required'
      );
    });

    it('should not call highlightElement when field name is empty', () => {
      const error = {
        fieldName: '',
        fieldDisplayName: 'Unknown Field',
        message: 'Error message',
      };

      component.highlightField(error);

      expect(driverJsService.highlightElement).not.toHaveBeenCalled();
    });

    it('should not call highlightElement when field name is missing', () => {
      const error = {
        fieldName: undefined as any,
        fieldDisplayName: 'Unknown Field',
        message: 'Error message',
      };

      component.highlightField(error);

      expect(driverJsService.highlightElement).not.toHaveBeenCalled();
    });

    it('should not call highlightElement when element does not exist in DOM', () => {
      const error = {
        fieldName: 'non_existent_field',
        fieldDisplayName: 'Non Existent Field',
        message: 'Error message',
      };

      component.highlightField(error);

      expect(driverJsService.highlightElement).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully and log to console', () => {
      spyOn(console, 'error');
      driverJsService.highlightElement.and.throwError('DriverJS error');

      const error = {
        fieldName: 'supplier_id',
        fieldDisplayName: 'Lieferant',
        message: 'Supplier is required',
      };

      component.highlightField(error);

      expect(console.error).toHaveBeenCalledWith(
        'Fehler beim Hervorheben des Feldes:',
        jasmine.any(Error)
      );
      expect(driverJsService.highlightElement).toHaveBeenCalled();
    });
  });
});
