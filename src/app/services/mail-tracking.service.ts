import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { UsersWrapperService } from './wrapper-services/users-wrapper.service';

const MAILS_SENT_PREFERENCE_TYPE = 'MAILS_SENT';

@Injectable({
  providedIn: 'root',
})
export class MailTrackingService {
  private readonly preferenceCache: Map<number, number> = new Map<number, number>();

  constructor(private readonly userService: UsersWrapperService) {}

  /**
   * Set the number of mails sent for a specific order
   */
  setMailsSentForOrder(orderId: number, count: number) {
    let response;

    if (this.preferenceCache.has(orderId)) {
      response = this.userService.updateCurrentUserPreferenceById(
        this.preferenceCache.get(orderId)!,
        { preference_type: MAILS_SENT_PREFERENCE_TYPE, preferences: { orderId, mailCount: count } }
      );
    } else {
      response = this.userService.addCurrentUserPreference({
        preference_type: MAILS_SENT_PREFERENCE_TYPE,
        preferences: { orderId, mailCount: count },
      });
    }

    return response.pipe(
      tap(preference => {
        this.preferenceCache.set(orderId, preference.id);
      }),
      map(preference => preference.preferences['mailCount'] as number)
    );
  }

  /**
   * Get the number of mails sent for a specific order
   */
  getMailsSentForOrder(orderId: number) {
    return this.userService.getCurrentUserPreferences().pipe(
      map(preferences => {
        const preference = preferences.find(p => p.preferences['orderId'] === orderId);
        if (preference) {
          this.preferenceCache.set(orderId, preference.id);
          return preference.preferences['mailCount'] as number;
        }
        return 0;
      })
    );
  }
}
