import { afterNextRender, Injectable, Injector, Type } from '@angular/core';
import { Router } from '@angular/router';
import { driver, DriveStep, PopoverDOM } from 'driver.js';
import 'driver.js/dist/driver.css';

@Injectable({
  providedIn: 'root',
})
export class DriverJsTourService {
  private readonly highlightDriver = driver();
  private tourDriver = driver();

  private readonly componentSteps: Map<string, () => DriveStep[]> = new Map();

  constructor(
    private readonly router: Router,
    private readonly injector: Injector
  ) { }

  /**
   * Starts a tour with the given components' registered steps.
   * @param components Array of component classes whose steps should be included in the tour.
   */
  startTour(components: Type<any>[]) {
    this.tourDriver.destroy();
    this.tourDriver = driver({
      showProgress: true,
      smoothScroll: true,
      steps: this.getStepsForComponents(components),
    });
    this.tourDriver.drive();
  }

  /**
   * Registers tour steps for a specific component.
   * @param component Class of the component
   * @param driverSteps Array of driver.js steps for the component
   */
  registerStepsForComponent(component: Type<any>, driverStepsSource: () => DriveStep[]) {
    this.componentSteps.set(component.name, driverStepsSource);
  }

  /**
   * Retrieves the registered steps for a specific component.
   * If no steps are registered, a default step indicating this is returned.
   * @param component Class of the component
   * @return Array of DriveStep objects for the component
   */
  getStepsForComponent(component: Type<any>): DriveStep[] {
    return (
      this.componentSteps.get(component.name)?.() ?? [
        {
          popover: {
            title: 'No steps registered',
            description: `No tour steps found for component: ${component.name}`,
          },
        },
      ]
    );
  }

  /**
   * Retrieves the registered steps for the specified components.
   * If a component has no registered steps, a default step indicating this is returned.
   * @param components Array of component classes
   * @return Array of DriveStep objects for the tour
   */
  getStepsForComponents(components: Type<any>[]): DriveStep[] {
    return components.flatMap(component => this.getStepsForComponent(component));
  }

  /**
   * Returns the current tour driver instance.
   * Can be used to control the tour externally, e.g. when defining a component's steps.
   * @return The current driver.js instance for the tour.
   */
  getTourDriver() {
    return this.tourDriver;
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
        description,
      },
    });
  }

  /**
   * Places the popover on top of a dialog to ensure visibility.
   * Necessary when highlighting Angular Material dialogs.
   * Call in onPopoverRender callback of a tour step.
   * @param popover The PopoverDOM instance to adjust
   */
  placePopoverOntopDialog(popover: PopoverDOM) {
    const parent = popover.wrapper.parentNode;
    for (const element of parent?.querySelectorAll('[popover]') ?? []) {
      element.removeAttribute('popover');
    }
    popover.wrapper.setAttribute('popover', 'manual');
  }

  /**
   * Starts a demo tour showcasing dynamic element loading and interaction.
   */
  startDemoTour() {
    const driverObject = driver({
      showProgress: true,
      steps: [
        {
          popover: {
            title: 'First Step',
            description: 'This is the first step. Next element will be loaded dynamically.',
          },
        },
        {
          element: '.Bestellungen',
          popover: {
            title: 'Orders Tab',
            description: 'This step highlights the orders tab.',
            // By passing onNextClick, you can override the default behavior of the next button.
            // This will prevent the driver from moving to the next step automatically.
            // You can then manually call driverObj.moveNext() to move to the next step.
            onNextClick: () => {
              // .. load element dynamically
              // .. and then call
              this.router.navigate(['/orders']).then(() => {
                // Wait for the next render cycle to ensure the element is in the DOM
                afterNextRender(
                  () => {
                    driverObject.moveNext();
                  },
                  { injector: this.injector }
                );
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
        {
          element: '.filter-menu',
          popover: {
            title: 'Filter Menu',
            description: 'This step highlights the filter menu.',
          },
        },
        { popover: { title: 'Last Step', description: 'This is the last step.' } },
      ],
    });

    driverObject.drive();
  }
}
