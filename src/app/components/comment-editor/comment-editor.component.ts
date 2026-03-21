import { Component, input, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderResponseDTO } from '../../api-services-v2';
import { OrdersWrapperService } from '../../services/wrapper-services/orders/orders-wrapper.service';

@Component({
  selector: 'app-comment-editor',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './comment-editor.component.html',
  styleUrl: './comment-editor.component.scss',
})
export class CommentEditorComponent implements OnInit, OnChanges {
  order = input<OrderResponseDTO>();
  internalOrder: OrderResponseDTO | undefined;
  commentControl: FormControl = new FormControl();
  isInitialized = false;

  constructor(private readonly orderService: OrdersWrapperService) {
    this.commentControl.disable();
  }

  ngOnInit(): void {
    this.setValues();
    this.isInitialized = true;
  }

  ngOnChanges(): void {
    if (this.isInitialized) {
      this.setValues();
    }
  }

  private setValues() {
    this.internalOrder = this.order();
    this.commentControl.setValue(this.order()?.comment);
  }

  edit() {
    this.commentControl.enable();
  }

  save() {
    this.commentControl.disable();
    if (this.internalOrder?.id == null) {
      return;
    }
    this.orderService
      .patchOrderById(this.internalOrder.id, { comment: this.commentControl.value })
      .then(updatedOrder => {
        this.internalOrder = updatedOrder;
        this.commentControl.setValue(this.internalOrder?.comment);
      });
  }

  cancel() {
    this.commentControl.disable();
    this.commentControl.setValue(this.order()?.comment);
  }
}
