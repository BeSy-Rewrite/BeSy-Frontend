import { Component } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { DriverJsTourService } from '../../services/driver.js-tour.service';

@Component({
  selector: 'app-homepage',
  imports: [
    MatButtonModule
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  constructor(private readonly driverJsTourService: DriverJsTourService) { }

  startTour() {
    this.driverJsTourService.startTour();
  }
}
