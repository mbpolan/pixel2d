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
export class MapCanvasComponent implements OnInit {

  @ViewChild('root') root: ElementRef;
  renderer: any;
  stage: any = new PIXI.Container();

  ngOnInit() {
    // create a new renderer and append it to the component view
    this.renderer = PIXI.autoDetectRenderer();
    this.root.nativeElement.appendChild(this.renderer.view);
    this.renderer.render(this.stage);
  }
}
