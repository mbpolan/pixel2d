import {Component} from '@angular/core'
import {NGB_TABSET_DIRECTIVES} from '@ng-bootstrap/ng-bootstrap';
import {MapCanvasComponent} from "./map-canvas/map-canvas.component";
import {AfterViewInit} from "@angular/core";
import {ViewChild} from "@angular/core";

@Component({
  selector: 'world-editor',
  directives: [NGB_TABSET_DIRECTIVES, MapCanvasComponent],
  styleUrls: ['./world-editor.style.css'],
  templateUrl: './world-editor.template.html'
})
export class WorldEditorComponent {

  @ViewChild(MapCanvasComponent)
  private mapCanvas: MapCanvasComponent;
}
