import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationService } from '../../services/authentication.service';
import { DriverJsTourService } from '../../services/driver.js-tour.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-homepage',
  imports: [
    MatButtonModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  constructor(public readonly authService: AuthenticationService,
    private readonly driverJsTourService: DriverJsTourService,
    private readonly utilsService: UtilsService
  ) { }

  startTour() {
    this.driverJsTourService.startDemoTour();
  }
  addConfetti() {
    this.utilsService.getConfettiInstance().addConfetti();
  }
}
