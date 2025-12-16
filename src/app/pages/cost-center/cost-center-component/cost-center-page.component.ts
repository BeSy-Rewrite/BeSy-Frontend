import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { CostCenterRequestDTO, CostCenterResponseDTO } from '../../../api-services-v2';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { COST_CENTER_FORM_CONFIG } from '../../../configs/cost-center-config';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { CostCenterWrapperService } from '../../../services/wrapper-services/cost-centers-wrapper.service';

@Component({
  selector: 'app-cost-center-component',
  imports: [
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    GenericTableComponent,
    FormComponent,
    MatButtonModule,
  ],
  templateUrl: './cost-center-page.component.html',
  styleUrl: './cost-center-page.component.scss',
})
export class CostCentersPageComponent implements OnInit {
  constructor(
    private readonly _notifications: MatSnackBar,
    private readonly costCenterWrapperService: CostCenterWrapperService
  ) {}

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  // Data source to be displayed in the cost-center-table component
  costCentersDataSource: MatTableDataSource<CostCenterResponseDTO> =
    new MatTableDataSource<CostCenterResponseDTO>([]);
  // Columns to be displayed in the cost-center-table component
  costCentersTableColumns = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Name' },
    { id: 'begin_date', label: 'Beginn' },
    { id: 'end_date', label: 'Ende' },
  ];

  costCenterForm = new FormGroup({});
  costCenterFormConfig = COST_CENTER_FORM_CONFIG;

  actions: TableActionButton[] = [
    {
      id: 'view',
      label: 'View',
      buttonType: 'text',
      color: ButtonColor.ACCENT,
      action: (row: CostCenterResponseDTO) => this.viewCostCenter(row),
    },
  ];

  async ngOnInit() {
    // Initialization logic here
    this.costCentersDataSource = new MatTableDataSource<CostCenterResponseDTO>(
      // Format cost center date from ISO format yyyy-MM-dd to dd.MM.yyyy
      (await this.costCenterWrapperService.getAllCostCenters()).map(cc => ({
        ...cc,
        begin_date: cc.begin_date ? this.formatDate(cc.begin_date) : undefined,
        end_date: cc.end_date ? this.formatDate(cc.end_date) : undefined,
      }))
    );
  }

  viewCostCenter(_row: CostCenterResponseDTO) {
    // Implement view logic here
  }

  async onSubmit() {
    if (this.costCenterForm.valid) {
      const costCenterData = this.costCenterForm.value as CostCenterRequestDTO;
      try {
        await this.costCenterWrapperService.createCostCenter(costCenterData);
        this._notifications.open('Kostenstelle erfolgreich erstellt', 'Schließen', {
          duration: 3000,
        });

        // Refresh the data source to include the newly created cost center
        this.costCentersDataSource = new MatTableDataSource<CostCenterResponseDTO>(
          (await this.costCenterWrapperService.getAllCostCenters()).map(cc => ({
            ...cc,
            begin_date: cc.begin_date ? this.formatDate(cc.begin_date) : undefined,
            end_date: cc.end_date ? this.formatDate(cc.end_date) : undefined,
          }))
        );
        this.tabGroup.selectedIndex = 0; // Switch to the first tab
      } catch (error) {
        this._notifications.open('Fehler beim Erstellen der Kostenstelle', 'Schließen', {
          duration: 3000,
        });
      }
    } else {
      // Handle invalid form case
      this.costCenterForm.markAllAsTouched();
    }
  }

  // * Handle back navigation
  onBack() {
    this.costCenterForm.reset();
    this.tabGroup.selectedIndex = 0; // Switch to tab index for "Kostenstellen verwalten"
  }

  // Format date from ISO format yyyy-MM-dd to dd.MM.yyyy
  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE');
  }
}
