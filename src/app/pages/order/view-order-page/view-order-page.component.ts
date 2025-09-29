import { Component, input } from '@angular/core';
import { OrderResponseDTO } from '../../../api';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-view-order-page',
  imports: [
    JsonPipe
  ],
  templateUrl: './view-order-page.component.html',
  styleUrl: './view-order-page.component.scss'
})
export class ViewOrderPageComponent {
  order = input.required<OrderResponseDTO>();
}