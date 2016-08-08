import {Component, ViewChild} from "@angular/core";
import {BS_VIEW_PROVIDERS, MODAL_DIRECTIVES, ModalDirective} from "ng2-bootstrap";
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {MapDetails} from "../map-details";

@Component({
  selector: 'new-dialog',
  directives: [MODAL_DIRECTIVES],
  viewProviders: [BS_VIEW_PROVIDERS],
  templateUrl: './new-dialog.template.html'
})
export class NewDialogComponent {

  @ViewChild(ModalDirective)
  private modal: ModalDirective;

  private mapWidth: number = 1000;
  private mapHeight: number = 1000;

  @Output()
  public onConfirmed = new EventEmitter<MapDetails>();

  /**
   * Displays the modal dialog.
   */
  public show(): void {
    this.modal.show();
  }

  /**
   * Handler invoked when the user clicks OK.
   */
  private onCommit(): void {
    this.modal.hide();
    this.onConfirmed.emit({
      width: this.mapWidth,
      height: this.mapHeight
    });
  }

  /**
   * Handler invoked when the user wishes to close the dialog.
   */
  private onClose(): void {
    this.modal.hide();
  }
}
