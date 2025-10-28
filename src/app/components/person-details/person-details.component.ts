import { ClipboardModule } from '@angular/cdk/clipboard';
import { Component, input, OnInit, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from '@angular/material/tooltip';
import { PersonResponseDTO, UserResponseDTO } from '../../apiv2';
import { PERSON_FIELD_NAMES } from '../../display-name-mappings/person-names';
import { PersonsWrapperService } from '../../services/wrapper-services/persons-wrapper.service';
import { UsersWrapperService } from '../../services/wrapper-services/users-wrapper.service';


@Component({
  selector: 'app-person-details',
  imports: [
    ClipboardModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './person-details.component.html',
  styleUrl: './person-details.component.scss'
})
export class PersonDetailsComponent implements OnInit {

  personId = input.required<number>();
  isUserId = input<boolean>(false);

  personGenderLoaded = output<'m' | 'f' | 'd'>();

  person!: PersonResponseDTO;
  personData = new Map<string, string>();
  personFieldLabels = PERSON_FIELD_NAMES;

  constructor(private readonly personsService: PersonsWrapperService,
    private readonly usersService: UsersWrapperService
  ) { }

  ngOnInit(): void {
    if (this.isUserId()) {
      this.usersService.getUserById(this.personId().toString()).subscribe(user => {
        this.person = this.userToPerson(user);
        this.setupPersonData();
      });
    } else {
      this.personsService.getPersonById(this.personId()).subscribe(person => {
        this.person = person;
        this.setupPersonData();
      });
    }
  }

  private setupPersonData(): void {
    for (const [key, value] of Object.entries(this.person)) {
      if (value && typeof value === 'string') {
        this.personData.set(key, value);
      }
    }
    this.personGenderLoaded.emit(this.person?.gender ?? 'd');
  }

  getFullName(): string {
    const names = [this.person?.title, this.person?.name, this.person?.surname];
    return names.filter(name => !!name).join(' ');
  }

  getInitials(): string {
    const name = this.person?.name + ' ' + this.person?.surname;
    return name.match(/\b(\w)/g)?.join('').toUpperCase() ?? '?';
  }

  userToPerson(user: UserResponseDTO): PersonResponseDTO {
    return {
      name: user.name,
      surname: user.surname,
      email: user.email,
    };
  }

}
