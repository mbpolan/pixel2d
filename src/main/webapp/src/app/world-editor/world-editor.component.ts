import {Component, AfterViewInit, ViewChild, OnDestroy} from "@angular/core";
import {NGB_TABSET_DIRECTIVES} from "@ng-bootstrap/ng-bootstrap";
import {MapCanvasComponent} from "./map-canvas/map-canvas.component";
import {TAB_DIRECTIVES} from "ng2-bootstrap";
import {WorldActions} from "./world-actions.service";
import {MapDetails} from "../map-details";
import {StatusBarComponent} from "./status-bar/status-bar.component";
import {Cursor} from "./cursor";

@Component({
  selector: 'world-editor',
  directives: [TAB_DIRECTIVES, MapCanvasComponent, StatusBarComponent],
  styleUrls: ['./world-editor.style.css'],
  templateUrl: './world-editor.template.html'
})
export class WorldEditorComponent implements AfterViewInit {

  @ViewChild(MapCanvasComponent)
  private mapCanvas: MapCanvasComponent;

  @ViewChild(StatusBarComponent)
  private statusBar: StatusBarComponent;

  public constructor(private worldActions: WorldActions) {
    worldActions.initializeNew$.subscribe(details => this.initializeNew(details));
  }

  /**
   * Handler invoked when all child views have been initialized.
   */
  public ngAfterViewInit(): void {
    // listen for cursor movements and update them on the status bar
    this.mapCanvas.cursorUpdated$.subscribe((c: Cursor) => this.statusBar.setCursor(c.x, c.y));
  }

  /**
   * Destroys the world definition and starts a new one.
   *
   * @param details Information about the new map.
   */
  private initializeNew(details: MapDetails): void {
    this.mapCanvas.initialize(details.width, details.height);
  }
}
