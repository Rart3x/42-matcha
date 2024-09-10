import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-browse-page',
  standalone: true,
  imports: [],
  template: `
    <p>
      browse-page works!
    </p>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowsePageComponent {

}
