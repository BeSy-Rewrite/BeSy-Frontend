import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { build } from '../../../environments/version';
import { UtilsService } from '../../services/utils.service';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let mockUtilsService: jasmine.SpyObj<UtilsService>;

  beforeEach(async () => {
    mockUtilsService = jasmine.createSpyObj('UtilsService', [
      'getApiVersion',
      'getConfettiInstance',
    ]);
    mockUtilsService.getApiVersion.and.returnValue(of('1.0.0'));
    mockUtilsService.getConfettiInstance.and.returnValue({
      addConfetti: jasmine.createSpy('addConfetti'),
      addConfettiAtPosition: jasmine.createSpy('addConfettiAtPosition'),
      clearCanvas: jasmine.createSpy('clearCanvas'),
      destroyCanvas: jasmine.createSpy('destroyCanvas'),
    });

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [{ provide: UtilsService, useValue: mockUtilsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set version from environment', () => {
    expect(component.build).toEqual(build);
  });

  it('should set bugReportUrl from environment', () => {
    expect(component.bugReportUrl).toEqual(environment.bugReportUrl);
  });

  it('should fetch api version on initialization', done => {
    setTimeout(() => {
      expect(mockUtilsService.getApiVersion).toHaveBeenCalled();
      expect(component.apiVersion).toBe('1.0.0');
      done();
    }, 0);
  });

  it('should call addConfetti when addConfetti method is invoked', () => {
    const confettiInstance = mockUtilsService.getConfettiInstance();
    component.addConfetti();
    expect(confettiInstance.addConfetti).toHaveBeenCalled();
  });

  it('should initialize apiVersion as undefined', () => {
    expect(component.apiVersion).toBeUndefined();
  });
});
