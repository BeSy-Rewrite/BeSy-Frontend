import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { LoginComponent } from "../login-indicator/login.component";
import { NavbarButtonComponent } from '../navbar-button/navbar-button.component';

@Component({
  selector: 'app-homebar',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    LoginComponent,
    NavbarButtonComponent
  ],
  templateUrl: './homebar.component.html',
  styleUrls: ['./homebar.component.scss'],
})
export class HomebarComponent {
  isMobileMenuOpen = signal(false);
  activeMenuItem = signal(0);

  links = [
    { name: 'Startseite', path: '/' },
    { name: 'Bestellungen', path: '/orders' },
    { name: 'Lieferanten', path: '/suppliers' },
    { name: 'Personen', path: '/persons' },
    { name: 'Kostenstellen', path: '/cost-centers' }
  ];

  constructor(public readonly router: Router) {
    router.events.subscribe(() => {
      const currentLinkIndex = this.links.findIndex(link => link.path === `/${router.url.split('/')[1]}`);
      this.activeMenuItem.set(currentLinkIndex !== -1 ? currentLinkIndex : 0);
    });
  }

}
