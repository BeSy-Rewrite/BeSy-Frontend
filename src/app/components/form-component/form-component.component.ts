import { Component, Input, OnInit, output, Signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from "@angular/material/divider";



export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'radio' | 'select' | 'number' | 'checkbox' | 'date' | 'email' | 'tel';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validators?: any[];
  emitAsSignal?: boolean;
}

export interface FormConfig {
  title: string;
  subtitle?: string;
  fields: FormField[];
}

@Component({
  selector: 'app-form-component',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatSelectModule, MatButtonModule, MatCardModule, MatInput, MatDividerModule],
  templateUrl: './form-component.component.html',
  styleUrls: ['./form-component.component.css'],
})
export class FormComponent implements OnInit {
  constructor(private fb: FormBuilder) {}

  @Input() config!: FormConfig;
  @Input() formGroup!: FormGroup;

  valueChanged = output<{ field: string; value: any }>();

  ngOnInit() {
    this.config.fields.forEach((field) => {
      this.formGroup.addControl(
        field.name,
        this.fb.control(field.defaultValue, field.validators || [])
      );
      if (field.emitAsSignal) {
        const control = this.formGroup.get(field.name);
        control?.valueChanges.subscribe((val) => {
          this.valueChanged.emit({ field: field.name, value: val });
        });
      }
    });
  }
}
