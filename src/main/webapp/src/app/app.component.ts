import {Component, ViewContainerRef, ViewChild} from "@angular/core";
import {ToolbarComponent} from "./toolbar/toolbar.component";
import {NewDialogComponent} from "./new-dialog/new-dialog.component";
import {ModalDirective, MODAL_DIRECTIVES, BS_VIEW_PROVIDERS} from "ng2-bootstrap";
import {AppActions} from "./app-actions.service";
import {MapDetails} from "./map-details";
import {ActivatedRoute} from "@angular/router";
import {WorldActions} from "./world-editor/world-actions.service";

@Component({
  selector: 'app',
  directives: [MODAL_DIRECTIVES, NewDialogComponent, ToolbarComponent],
  providers: [AppActions, WorldActions],
  styleUrls: ['./app.style.css'],
  templateUrl: './app.template.html'
})
export class AppComponent {

  @ViewChild(NewDialogComponent)
  private newModal: NewDialogComponent;

  public constructor(private viewContainerRef:ViewContainerRef,
                     private appActions: AppActions,
                     private worldActions: WorldActions) {

    this.viewContainerRef = viewContainerRef;

    // show the new map modal when the user triggers the new map action
    appActions.newMap$.subscribe(() => this.newModal.show());
  }

  /**
   * Handler invoked when the user wants to create a new map.
   *
   * @param details Information about the new map.
   */
  private onNewMap(details: MapDetails): void {
    this.worldActions.initializeNew(details);
  }
}
