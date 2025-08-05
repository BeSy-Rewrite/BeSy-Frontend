import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { GenericTableComponent } from "../../components/generic-table/generic-table.component";
import { ButtonColor, TableActionButton, TableColumn } from '../../models/generic-table';

@Component({
  selector: 'app-table-demo',
  imports: [GenericTableComponent],
  templateUrl: './table-demo.component.html',
  styleUrl: './table-demo.component.css'
})

export class TableDemoComponent {
  constructor(private readonly snackBar: MatSnackBar) { }
  /**
   * The data source for the table, required to be provided.
   */
  dataSource: MatTableDataSource<any> = new MatTableDataSource([
    { name: 'John Doe', age: 30, email: 'john.doe@example.com', secret: 'Top Secret 1' },
    { name: 'Jane Smith', age: 25, email: 'jane.smith@example.com', secret: 'Top Secret 2' },
    { name: 'Alice Johnson', age: 35, email: 'alice.johnson@example.com', secret: 'Top Secret 3' }
  ]);

  /**
   * The column definitions for the table, required to be provided.
   * The id must match the keys in the data source.
   *
   * Each column can have an optional action that will be executed when the column is clicked.
   * If the action is defined, it will be executed with the row data as an argument.
   */
  columns: TableColumn[] = [
    { id: 'name', label: 'Name', isUnsortable: true, action: (row: any) => this.handleExampleColumnAction(row) },
    { id: 'age', label: 'Age', isUnsortable: false },
    { id: 'email', label: 'Email' }, // This column is sortable by default
    { id: 'secret', label: 'Secret', isInvisible: true } // This column is not displayed
  ];

  /**
   * The action buttons to be displayed in the table, optional.
   * If not provided, no action buttons will be displayed.
   */
  actions: TableActionButton[] = [
    {
      id: 'edit',
      label: 'Edit',
      buttonType: 'elevated',
      color: ButtonColor.PRIMARY,
    },
    {
      id: 'delete',
      label: 'Delete',
      buttonType: 'filled',
      color: ButtonColor.WARN,
    },
    {
      id: 'view',
      label: 'View',
      buttonType: 'text',
      color: ButtonColor.ACCENT,
      action: (row: any) => console.log('Viewing row:', row)
    },
    {
      id: 'custom',
      label: 'Custom Action',
      buttonType: 'outlined',
      color: ButtonColor.DEFAULT,
      action: (row: any) => console.log('Custom action on row:', row)
    },
    {
      id: 'info',
      label: 'Info',
      buttonType: 'tonal',
      action: (row: any) => console.log('Info action on row:', row)
    }
  ]

  handleExampleColumnAction(row: any) {
    console.log('Example column action on row:', row);
    this.snackBar.open('Aktion für Zeile ausgeführt!\n' + JSON.stringify(row), 'Schließen', {
      duration: 3000,
      verticalPosition: 'top',
    });
  }

}
