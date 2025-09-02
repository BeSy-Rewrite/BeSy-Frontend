import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  CostCenterRequestDTO,
  CostCenterResponseDTO,
  SupplierResponseDTO,
} from '../../../api';
import { CostCentersService } from '../../../api';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { MatTabGroup } from '@angular/material/tabs';
import { MatTab } from '@angular/material/tabs';
import { MatDivider } from '@angular/material/divider';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { COST_CENTER_FORM_CONFIG } from '../../../configs/cost-center-config';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cost-center-component',
  imports: [
    MatTabGroup,
    MatTab,
    MatDivider,
    GenericTableComponent,
    FormComponent,
    MatButtonModule,
  ],
  templateUrl: './cost-center-page.component.html',
  styleUrl: './cost-center-page.component.css',
})
export class CostCentersPageComponent implements OnInit {
  constructor(private _notifications: MatSnackBar) {}

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
      (await CostCentersService.getCostCenters()).map((cc) => ({
        ...cc,
        begin_date: cc.begin_date ? this.formatDate(cc.begin_date) : undefined,
        end_date: cc.end_date ? this.formatDate(cc.end_date) : undefined,
      }))
    );
  }

  viewCostCenter(row: CostCenterResponseDTO) {
    // Implement view logic here
  }

  async onSubmit() {
    if (this.costCenterForm.valid) {
      const costCenterData = this.costCenterForm.value as CostCenterRequestDTO;
      try {
        await CostCentersService.createCostCenter(costCenterData);
        this._notifications.open(
          'Kostenstelle erfolgreich erstellt',
          'Schließen',
          {
            duration: 3000,
          }
        );

        // Refresh the data source to include the newly created cost center
        this.costCentersDataSource =
          new MatTableDataSource<CostCenterResponseDTO>(
            (await CostCentersService.getCostCenters()).map((cc) => ({
              ...cc,
              begin_date: cc.begin_date
                ? this.formatDate(cc.begin_date)
                : undefined,
              end_date: cc.end_date ? this.formatDate(cc.end_date) : undefined,
            }))
          );
        this.tabGroup.selectedIndex = 0; // Switch to the first tab
      } catch (error) {
        this._notifications.open(
          'Fehler beim Erstellen der Kostenstelle',
          'Schließen',
          {
            duration: 3000,
          }
        );
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
