import {Component} from '@angular/core'
import {NGB_DIRECTIVES, NGB_PRECOMPILE} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app',
  directives: [NGB_DIRECTIVES],
  precompile: [NGB_PRECOMPILE],
  styleUrls: ['./app.style.css'],
  templateUrl: './app.template.html'
})
export class AppComponent {

}
