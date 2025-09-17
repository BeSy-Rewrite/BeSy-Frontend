import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar-button',
  templateUrl: './navbar-button.component.html',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgClass
  ],
  styleUrls: ['./navbar-button.component.scss']
})
export class NavbarButtonComponent {
  @Input() label!: string;
  @Input() routerLink!: string;
  @Input() isExact: boolean = false;
  @Input() extraClasses: string = "";
}
