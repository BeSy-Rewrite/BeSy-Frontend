import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { DriverJsTourService } from '../../services/driver.js-tour.service';
import { UtilsService } from '../../utils.service';

@Component({
  selector: 'app-homepage',
  imports: [
    MatButtonModule,
    RouterLink

  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  constructor(
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
