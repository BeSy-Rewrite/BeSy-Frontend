import { Injectable } from '@angular/core';
import { map, of } from 'rxjs';
import { UserPreferencesResponseDTO } from '../api-services-v2';
import { UsersWrapperService } from './wrapper-services/users-wrapper.service';


const MAILS_SENT_PREFERENCE_TYPE = 'MAILS_SENT';


@Injectable({
  providedIn: 'root',
})
export class MailTrackingService {
  private readonly preferenceCache: Map<number, number> = new Map<number, number>();

  constructor(private readonly userService: UsersWrapperService) { }

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
      //response = this.userService.addCurrentUserPreference({ preference_type: MAILS_SENT_PREFERENCE_TYPE, preferences: { orderId, mailCount: count } })
      response = of({ id: -1, preference_type: 'ORDER_PRESETS', preferences: { orderId, mailCount: count } } as UserPreferencesResponseDTO); // Placeholder until multiple preference types are supported
    }

    return response.pipe(
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
