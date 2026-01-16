import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../services/authentication.service';
import { WrappedBannerComponent } from './wrapped-banner.component';

describe('WrappedBannerComponent', () => {
    let component: WrappedBannerComponent;
    let fixture: ComponentFixture<WrappedBannerComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
    let authStateChanged: Subject<void>;

    beforeEach(async () => {
        authStateChanged = new Subject<void>();
        authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['hasValidToken'], {
            authStateChanged: authStateChanged.asObservable(),
        });

        await TestBed.configureTestingModule({
            imports: [WrappedBannerComponent, RouterModule.forRoot([])],
            providers: [{ provide: AuthenticationService, useValue: authServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(WrappedBannerComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should set visible to false when wrapped is disabled', () => {
            spyOn(component as any, 'isWrappedEnabled').and.returnValue(false);
            authServiceSpy.hasValidToken.and.returnValue(true);

            fixture.detectChanges();

            expect(component.visible).toBe(false);
        });

        it('should set visible to false when not authenticated', () => {
            spyOn(component as any, 'isWrappedEnabled').and.returnValue(true);
            spyOn(component as any, 'isGenerationMonth').and.returnValue(true);
            authServiceSpy.hasValidToken.and.returnValue(false);

            fixture.detectChanges();

            expect(component.visible).toBe(false);
        });

        it('should set visible to true when all conditions are met', () => {
            spyOn(component as any, 'isWrappedEnabled').and.returnValue(true);
            spyOn(component as any, 'isGenerationMonth').and.returnValue(true);
            authServiceSpy.hasValidToken.and.returnValue(true);

            fixture.detectChanges();

            expect(component.visible).toBe(true);
        });

        it('should update visibility when auth state changes', () => {
            spyOn(component as any, 'isWrappedEnabled').and.returnValue(true);
            spyOn(component as any, 'isGenerationMonth').and.returnValue(true);
            authServiceSpy.hasValidToken.and.returnValue(false);

            fixture.detectChanges();
            expect(component.visible).toBe(false);

            authServiceSpy.hasValidToken.and.returnValue(true);
            authStateChanged.next();

            expect(component.visible).toBe(true);
        });
    });

    describe('isGenerationMonth()', () => {
        it('should return true when current month is in wrappedBannerMonths', () => {
            const currentMonth = new Date().getMonth();
            spyOnProperty(environment, 'wrappedBannerMonths', 'get').and.returnValue([currentMonth]);

            const result = component['isGenerationMonth']();

            expect(result).toBe(true);
        });

        it('should return false when current month is not in wrappedBannerMonths', () => {
            const currentMonth = new Date().getMonth();
            const otherMonth = (currentMonth + 1) % 12;
            spyOnProperty(environment, 'wrappedBannerMonths', 'get').and.returnValue([otherMonth]);

            const result = component['isGenerationMonth']();

            expect(result).toBe(false);
        });

        it('should return false when wrappedBannerMonths is not an array', () => {
            spyOnProperty(environment, 'wrappedBannerMonths', 'get').and.returnValue(null as any);

            const result = component['isGenerationMonth']();

            expect(result).toBe(false);
        });

        it('should return false when wrappedBannerMonths is empty', () => {
            spyOnProperty(environment, 'wrappedBannerMonths', 'get').and.returnValue([]);

            const result = component['isGenerationMonth']();

            expect(result).toBe(false);
        });
    });

    describe('dismiss()', () => {
        it('should set visible to false', () => {
            component.visible = true;

            component.dismiss();

            expect(component.visible).toBe(false);
        });

        it('should store dismissal in localStorage', () => {
            const now = new Date();
            const expectedKey = `besy-wrapped-banner-dismissed-${now.getFullYear()}-${now.getMonth()}`;
            spyOn(localStorage, 'setItem');

            component.dismiss();

            expect(localStorage.setItem).toHaveBeenCalledWith(expectedKey, 'true');
        });

        it('should handle localStorage errors gracefully', () => {
            spyOn(localStorage, 'setItem').and.throwError('Storage error');

            expect(() => component.dismiss()).not.toThrow();
            expect(component.visible).toBe(false);
        });
    });

    describe('onWrappedPage()', () => {
        it('should return true when on wrapped page (pathname)', () => {
            spyOnProperty(environment, 'wrappedUrl', 'get').and.returnValue('/wrapped');
            spyOnProperty(globalThis.location, 'pathname', 'get').and.returnValue('/wrapped');

            const result = component.onWrappedPage();

            expect(result).toBe(true);
        });

        it('should return true when on wrapped page (hash)', () => {
            spyOnProperty(environment, 'wrappedUrl', 'get').and.returnValue('#/wrapped');
            spyOnProperty(globalThis.location, 'pathname', 'get').and.returnValue('/other');
            spyOnProperty(globalThis.location, 'hash', 'get').and.returnValue('#/wrapped');

            const result = component.onWrappedPage();

            expect(result).toBe(true);
        });

        it('should return false when not on wrapped page', () => {
            spyOnProperty(environment, 'wrappedUrl', 'get').and.returnValue('/wrapped');
            spyOnProperty(globalThis.location, 'pathname', 'get').and.returnValue('/other');
            spyOnProperty(globalThis.location, 'hash', 'get').and.returnValue('');

            const result = component.onWrappedPage();

            expect(result).toBe(false);
        });
    });

    describe('isWrappedEnabled()', () => {
        it('should return true when wrappedEnabled is true', () => {
            spyOnProperty(environment, 'wrappedEnabled', 'get').and.returnValue(true);

            const result = component['isWrappedEnabled']();

            expect(result).toBe(true);
        });

        it('should return false when wrappedEnabled is false', () => {
            spyOnProperty(environment, 'wrappedEnabled', 'get').and.returnValue(false);

            const result = component['isWrappedEnabled']();

            expect(result).toBe(false);
        });

        it('should return false when wrappedEnabled is undefined', () => {
            const env = environment as any;
            delete env.wrappedEnabled;

            const result = component['isWrappedEnabled']();

            expect(result).toBe(false);
        });
    });

    describe('shouldShowBanner()', () => {
        beforeEach(() => {
            spyOnProperty(environment, 'wrappedBannerEnabled', 'get').and.returnValue(true);
            spyOn(component as any, 'isWrappedEnabled').and.returnValue(true);
            spyOn(component as any, 'isGenerationMonth').and.returnValue(true);
            authServiceSpy.hasValidToken.and.returnValue(true);
        });

        it('should return false when wrappedBannerEnabled is not in environment', () => {
            const env = environment as any;
            delete env.wrappedBannerEnabled;

            const result = component['shouldShowBanner']();

            expect(result).toBe(false);
        });

        it('should return false when wrappedBannerEnabled is false', () => {
            spyOnProperty(environment, 'wrappedBannerEnabled', 'get').and.returnValue(false);

            const result = component['shouldShowBanner']();

            expect(result).toBe(false);
        });

        it('should return false when wrapped feature is disabled', () => {
            (component as any).isWrappedEnabled.and.returnValue(false);

            const result = component['shouldShowBanner']();

            expect(result).toBe(false);
        });

        it('should return false when not in generation month', () => {
            (component as any).isGenerationMonth.and.returnValue(false);

            const result = component['shouldShowBanner']();

            expect(result).toBe(false);
        });

        it('should return false when banner is dismissed', () => {
            const now = new Date();
            const dismissKey = `besy-wrapped-banner-dismissed-${now.getFullYear()}-${now.getMonth()}`;
            localStorage.setItem(dismissKey, 'true');

            const result = component['shouldShowBanner']();

            expect(result).toBe(false);
        });

        it('should return false when user has no valid token', () => {
            authServiceSpy.hasValidToken.and.returnValue(false);

            const result = component['shouldShowBanner']();

            expect(result).toBe(false);
        });

        it('should return true when all conditions are met', () => {
            const result = component['shouldShowBanner']();

            expect(result).toBe(true);
        });
    });

    describe('ctaUrl', () => {
        it('should be set from environment', () => {
            spyOnProperty(environment, 'wrappedUrl', 'get').and.returnValue('/test-wrapped');

            const newComponent = new WrappedBannerComponent(authServiceSpy);

            expect(newComponent.ctaUrl).toBe('/test-wrapped');
        });
    });
});
