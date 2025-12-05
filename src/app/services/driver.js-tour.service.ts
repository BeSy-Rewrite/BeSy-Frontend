import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

@Injectable({
  providedIn: 'root'
})
export class DriverJsTourService {

  driverObject = driver({
    showProgress: true,
    steps: [
      {
        popover: {
          title: 'First Step',
          description: 'This is the first step. Next element will be loaded dynamically.',
          // By passing onNextClick, you can override the default behavior of the next button.
          // This will prevent the driver from moving to the next step automatically.
          // You can then manually call driverObj.moveNext() to move to the next step.
          onNextClick: () => {
            // .. load element dynamically
            // .. and then call
            this.router.navigate(['orders']).then(() => setTimeout(() => this.driverObject.moveNext(), 10));
          },
        },
      },
      {
        element: '.order-list',
        popover: {
          title: 'Order List',
          description: 'This step highlights the order list.',
        },
      },
      { popover: { title: 'Last Step', description: 'This is the last step.' } }
    ]
  });

  constructor(private readonly router: Router) { }

  startTour() {
    this.driverObject.drive();
  }

  highlightElement(selector: string, title: string, description: string) {
    this.driverObject.highlight({
      element: selector,
      popover: {
        title,
        description
      }
    });
  }
}
