import {OnInit} from "@angular/core";
import {TemplateRef} from "@angular/core";
import {ViewContainerRef} from "@angular/core";
import {ViewChild} from "@angular/core";
import {ElementRef} from "@angular/core";
import {Component} from "@angular/core";

// declare the PIXI.js library
declare var PIXI: any;

@Component({
  selector: 'map-canvas',
  templateUrl: './map-canvas.template.html'
})
export class MapCanvasComponent {

  @ViewChild('root') root: ElementRef;
  renderer: any;
  stage: any;

  initialize(width: number, height: number) {
    // create a new renderer and append it to the component view
    if (!this.renderer) {
      this.renderer = PIXI.autoDetectRenderer(width, height);
      this.root.nativeElement.appendChild(this.renderer.view);
      this.renderer.render(this.stage);
    }

    else {
      this.renderer.resize(width, height);
      this.stage.removeChildren();
    }
  }
}
