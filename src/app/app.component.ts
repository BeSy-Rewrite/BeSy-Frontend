import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { HomebarComponent } from './components/homebar/homebar.component';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatButtonModule,
    ScrollingModule,
    HomebarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'besy-frontend';
  environment = environment;
  constructor(
    public readonly authService: AuthenticationService,
    private readonly iconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer
  ) {
    this.iconRegistry.addSvgIcon(
      "cancel",
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/cancel.svg')
    );
  }

}
