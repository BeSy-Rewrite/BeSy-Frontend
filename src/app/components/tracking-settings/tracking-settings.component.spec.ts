import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { of, throwError } from 'rxjs';
import { TrackingService, TrackingSettings } from '../../services/tracking.service';
import { TrackingSettingsComponent } from './tracking-settings.component';

describe('TrackingSettingsComponent', () => {
  let component: TrackingSettingsComponent;
  let fixture: ComponentFixture<TrackingSettingsComponent>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(async () => {
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'getTrackingSettings',
      'setTrackingSettings',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        TrackingSettingsComponent,
        MatSlideToggleModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        FormsModule,
      ],
      providers: [
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
    }).compileComponents();

    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    fixture = TestBed.createComponent(TrackingSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tracking settings on init', () => {
    const settings: TrackingSettings = { disableTracking: false };
    trackingService.getTrackingSettings.and.returnValue(of(settings));

    fixture.detectChanges();

    expect(trackingService.getTrackingSettings).toHaveBeenCalled();
    expect(component['trackingEnabled']()).toBe(true);
    expect(component['isLoading']()).toBe(false);
  });

  it('should set trackingEnabled to false when disableTracking is true', () => {
    const settings: TrackingSettings = { disableTracking: true };
    trackingService.getTrackingSettings.and.returnValue(of(settings));

    fixture.detectChanges();

    expect(component['trackingEnabled']()).toBe(false);
  });

  it('should handle error when loading tracking settings', () => {
    trackingService.getTrackingSettings.and.returnValue(
      throwError(() => new Error('Failed to load'))
    );
    spyOn(console, 'error');

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith('Failed to load tracking settings');
    expect(component['isLoading']()).toBe(false);
  });

  it('should toggle tracking and update signal on success', () => {
    const settings: TrackingSettings = { disableTracking: false };
    trackingService.getTrackingSettings.and.returnValue(of(settings));
    trackingService.setTrackingSettings.and.returnValue(of({} as any));

    fixture.detectChanges();
    const initialState = component['trackingEnabled']();

    component['toggleTracking']();

    expect(trackingService.setTrackingSettings).toHaveBeenCalledWith({
      disableTracking: initialState,
    });
    expect(component['trackingEnabled']()).toBe(!initialState);
    expect(component['isSaving']()).toBe(false);
  });

  it('should handle error when toggling tracking', () => {
    const settings: TrackingSettings = { disableTracking: false };
    trackingService.getTrackingSettings.and.returnValue(of(settings));
    trackingService.setTrackingSettings.and.returnValue(
      throwError(() => new Error('Failed to save'))
    );
    spyOn(console, 'error');

    fixture.detectChanges();

    component['toggleTracking']();

    expect(console.error).toHaveBeenCalledWith('Failed to toggle tracking');
    expect(component['isSaving']()).toBe(false);
  });

  it('should set isSaving to true while toggling', () => {
    const settings: TrackingSettings = { disableTracking: false };
    trackingService.getTrackingSettings.and.returnValue(of(settings));
    let isSavingValue = false;
    trackingService.setTrackingSettings.and.callFake(() => {
      isSavingValue = component['isSaving']();
      return of({} as any);
    });

    fixture.detectChanges();

    component['toggleTracking']();

    expect(isSavingValue).toBe(true);
  });
});
