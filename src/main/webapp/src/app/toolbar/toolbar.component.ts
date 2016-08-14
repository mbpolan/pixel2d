import {Component, ViewChild, ViewContainerRef} from "@angular/core";
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS, ModalDirective} from "ng2-bootstrap";
import {AppActions} from "../app-actions.service";

@Component({
  selector: 'toolbar',
  styleUrls: ['./toolbar.style.css'],
  templateUrl: './toolbar.template.html'
})
export class ToolbarComponent {

  private showGridLines: boolean = true;

  public constructor(private appActions: AppActions) {
  }

  private onToggleGridLines(): void {
    this.showGridLines = !this.showGridLines;
    this.appActions.toggleGridLines(this.showGridLines);
  }

  /**
   * Handler invoked when the user clicks the New button.
   */
  private onShowNewModal(): void {
    this.appActions.newMap();
  }
}
