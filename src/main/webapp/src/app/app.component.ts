import {Component, ViewContainerRef, ViewChild} from "@angular/core";
import {ToolbarComponent} from "./toolbar/toolbar.component";
import {NewDialogComponent} from "./new-dialog/new-dialog.component";
import {ModalDirective, MODAL_DIRECTIVES, BS_VIEW_PROVIDERS} from "ng2-bootstrap";
import {AppActions} from "./app-actions.service";
import {MapDetails} from "./new-dialog/map-details";

@Component({
  selector: 'app',
  directives: [MODAL_DIRECTIVES, NewDialogComponent, ToolbarComponent],
  providers: [AppActions],
  styleUrls: ['./app.style.css'],
  templateUrl: './app.template.html'
})
export class AppComponent {

  @ViewChild(NewDialogComponent)
  private newModal: NewDialogComponent;

  public constructor(private viewContainerRef:ViewContainerRef,
                     private appActions: AppActions) {

    this.viewContainerRef = viewContainerRef;
    appActions.newMap$.subscribe(() => this.newModal.show());
  }

  /**
   * Handler invoked when the user wants to create a new map.
   *
   * @param details Information about the new map.
   */
  private onNewMap(details: MapDetails): void {
    console.log(details);
  }
}
