import {Component, AfterViewInit, ViewChild, OnDestroy} from "@angular/core";
import {NGB_TABSET_DIRECTIVES} from "@ng-bootstrap/ng-bootstrap";
import {MapCanvasComponent} from "./map-canvas/map-canvas.component";
import {TAB_DIRECTIVES} from "ng2-bootstrap";
import {WorldActions} from "./world-actions.service";
import {MapDetails} from "../map-details";

@Component({
  selector: 'world-editor',
  directives: [TAB_DIRECTIVES, MapCanvasComponent],
  styleUrls: ['./world-editor.style.css'],
  templateUrl: './world-editor.template.html'
})
export class WorldEditorComponent {

  @ViewChild(MapCanvasComponent)
  private mapCanvas: MapCanvasComponent;

  public constructor(private worldActions: WorldActions) {
    worldActions.initializeNew$.subscribe(details => this.initializeNew(details));
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
