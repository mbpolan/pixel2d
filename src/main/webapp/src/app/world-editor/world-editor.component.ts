import {Component, AfterViewInit, ViewChild} from "@angular/core";
import {NGB_TABSET_DIRECTIVES} from "@ng-bootstrap/ng-bootstrap";
import {MapCanvasComponent} from "./map-canvas/map-canvas.component";
import {TAB_DIRECTIVES} from "ng2-bootstrap";

@Component({
  selector: 'world-editor',
  directives: [TAB_DIRECTIVES, MapCanvasComponent],
  styleUrls: ['./world-editor.style.css'],
  templateUrl: './world-editor.template.html'
})
export class WorldEditorComponent {

  @ViewChild(MapCanvasComponent)
  private mapCanvas: MapCanvasComponent;
}
