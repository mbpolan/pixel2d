import {Component, ViewChild, ViewContainerRef} from "@angular/core";
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS, ModalDirective} from "ng2-bootstrap";
import {AppActions} from "../app-actions.service";

@Component({
  selector: 'toolbar',
  styleUrls: ['./toolbar.style.css'],
  templateUrl: './toolbar.template.html'
})
export class ToolbarComponent {

  public constructor(private appActions: AppActions) {
  }

  /**
   * Handler invoked when the user clicks the New button.
   */
  private onShowNewModal(): void {
    this.appActions.newMap();
  }
}
