import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [],
  template: `
    <p>
      chat-page works!
    </p>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPageComponent {

}
