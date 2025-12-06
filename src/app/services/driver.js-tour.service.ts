import { afterNextRender, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

@Injectable({
  providedIn: 'root'
})
export class DriverJsTourService {

  private readonly highlightDriver = driver();

  constructor(private readonly router: Router,
    private readonly injector: Injector
  ) { }

  /**
   * Starts the driver.js tour.
   */
  startTour() {
    const driverObject = driver({
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
              this.router.navigate(['/orders']).then(() => {
                // Wait for the next render cycle to ensure the element is in the DOM
                afterNextRender(() => {
                  driverObject.moveNext();
                }, { injector: this.injector });
              });
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


    driverObject.drive();
  }

  /**
   * Highlights an element on the page with a popover.
   * @param selector CSS selector of the element to highlight
   * @param title Title of the popover
   * @param description Description text of the popover
   */
  highlightElement(selector: string, title: string, description: string) {
    this.highlightDriver.highlight({
      element: selector,
      popover: {
        title,
        description
      }
    });
  }
}
