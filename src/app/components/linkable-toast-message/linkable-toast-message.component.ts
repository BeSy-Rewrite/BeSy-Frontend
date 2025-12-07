import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type LinkObject = {
  text: string;
  url: string;
};

@Component({
  selector: 'app-linkable-toast-message',
  imports: [
    RouterLink
  ],
  templateUrl: './linkable-toast-message.component.html',
  styleUrl: './linkable-toast-message.component.scss',
})
export class LinkableToastMessageComponent {
  /**
   * The main message to display in the toast.
   * Any occurrence of the placeholder '{LINK}' will be replaced by the links provided.
   */
  message = input<string>('');
  /** The links to display in the toast. */
  links = input<LinkObject[]>([]);

  /** The processed content of the message, split into text and link parts. */
  internalContent = computed(() =>
    this.message().split('{LINK}').map((part, index) => ({
      text: part,
      link: this.links()[index]
    }))
  );
}
