import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { version } from '../../../environments/version';
import { UtilsService } from '../../utils.service';

@Component({
  selector: 'app-footer',
  imports: [
    MatButtonModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  version = version;
  apiVersion: string | undefined = undefined;
  bugReportUrl = environment.bugReportUrl;

  constructor(private readonly utilsService: UtilsService) {
    this.utilsService.getApiVersion().subscribe((version) => {
      this.apiVersion = version;
    });
  }

  addConfetti() {
    this.utilsService.getConfettiInstance().addConfetti();
  }
}
