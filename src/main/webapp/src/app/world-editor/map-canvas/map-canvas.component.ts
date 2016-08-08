import {OnInit, TemplateRef, ViewContainerRef, ViewChild, ElementRef, Component} from "@angular/core";

// declare the PIXI.js library
declare var PIXI: any;

// the size of a single tile in pixels
const TILE_SIZE = 32;

@Component({
  selector: 'map-canvas',
  templateUrl: './map-canvas.template.html'
})
export class MapCanvasComponent {

  @ViewChild('root')
  private root: ElementRef;

  private renderer: any;
  private stage: any;

  /**
   * Creates a new canvas of the given size.
   *
   * @param width The width of the map canvas, in tiles.
   * @param height The height of the map canvas, in tiles.
   */
  public initialize(width: number, height: number) {
    // create a new renderer and append it to the component view
    if (!this.renderer) {
      this.renderer = PIXI.autoDetectRenderer(width * TILE_SIZE, height * TILE_SIZE);
      this.root.nativeElement.appendChild(this.renderer.view);

      this.stage = new PIXI.Container();
      this.renderer.render(this.stage);
    }

    else {
      this.renderer.resize(width * TILE_SIZE, height * TILE_SIZE);
      this.stage.removeChildren();
    }
  }
}
