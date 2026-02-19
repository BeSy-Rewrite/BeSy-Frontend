import { Injectable } from '@angular/core';
import JSConfetti from 'js-confetti';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  private readonly jsConfetti = new JSConfetti();
  apiVersion = environment.apiVersion;

  constructor() {}

  getConfettiInstance(): JSConfetti {
    return this.jsConfetti;
  }

  getApiVersion(): string {
    return this.apiVersion;
  }
}
