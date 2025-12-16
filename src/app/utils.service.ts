import { Injectable } from '@angular/core';
import JSConfetti from 'js-confetti';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  private readonly jsConfetti = new JSConfetti();

  getConfettiInstance(): JSConfetti {
    return this.jsConfetti;
  }
}
