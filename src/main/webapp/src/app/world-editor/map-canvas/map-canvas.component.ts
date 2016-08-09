import {OnInit, TemplateRef, ViewContainerRef, ViewChild, ElementRef, Component} from "@angular/core";

// declare the PIXI.js library
declare var PIXI: any;

// the size of a single tile in pixels
const TILE_SIZE = 32;

@Component({
  selector: 'map-canvas',
  styleUrls: ['./map-canvas.style.css'],
  templateUrl: './map-canvas.template.html'
})
export class MapCanvasComponent {

  @ViewChild('root')
  private root: ElementRef;

  private renderer: any;
  private stage: any;
  private gridLines: any;
  private cursor: any;
  private tilesWide: number;
  private tilesHigh: number;

  /**
   * Creates a new canvas of the given size.
   *
   * @param width The width of the map canvas, in tiles.
   * @param height The height of the map canvas, in tiles.
   */
  public initialize(width: number, height: number) {
    this.tilesWide = width;
    this.tilesHigh = height;

    // create a new renderer and append it to the component view
    if (!this.renderer) {
      var rect = this.root.nativeElement.getBoundingClientRect();

      // create a new renderer and size it to fit the parent div
      this.renderer = PIXI.autoDetectRenderer(rect.width, rect.height);
      this.root.nativeElement.appendChild(this.renderer.view);

      // create a new stage and size it to contain the amount of tiles
      this.stage = new PIXI.Container();
      this.stage.width = width * TILE_SIZE;
      this.stage.height = height * TILE_SIZE;

      // create grid lines for the map
      this.gridLines = this.createGridLines();

      // create a new tile cursor
      this.cursor = this.createCursor();

      // set the stage to be interactive and track mouse movements
      this.stage.interactive = true;
      this.stage.on('mousemove', (e) => this.onMouseMove(e));

      this.renderLoop();
    }

    else {
      // FIXME: handle resizing
      this.stage.removeChildren();
    }

    // always add the cursor to the stage
    this.stage.addChild(this.gridLines);
    this.stage.addChild(this.cursor);
  }

  /**
   * Draws the next frame of animation.
   */
  private renderLoop = () => {
    requestAnimationFrame(this.renderLoop);

    this.renderer.render(this.stage);
  };

  /**
   * Creates a rectangle cursor used to track the currently moused-over tile.
   *
   * @returns {PIXI.Graphics} A rectangle container.
   */
  private createCursor(): any {
    let g = new PIXI.Graphics();

    g.beginFill(0x0077FF, 0.5);
    g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
    g.endFill();

    return g;
  }

  /**
   * Draws a series of grdlines across the entire stage.
   *
   * @returns {PIXI.Graphics} A container of lines.
   */
  private createGridLines(): any {
    let g = new PIXI.Graphics();
    g.lineStyle(1, 0xFFFFFF);

    // draw vertical lines
    for (let x = 0; x <= this.tilesWide; x++) {
      g.moveTo(x * TILE_SIZE, 0);
      g.lineTo(x * TILE_SIZE, this.tilesHigh * TILE_SIZE);
    }

    // draw horizontal lines
    for (let y = 0; y <= this.tilesHigh; y++) {
      g.moveTo(0, y * TILE_SIZE);
      g.lineTo(this.tilesWide * TILE_SIZE, y * TILE_SIZE);
    }

    g.endFill();
    return g;
  }

  /**
   * Handler invoked when the mouse cursor moves over the canvas.
   *
   * @param e The native mouse event.
   */
  private onMouseMove(e: any): void {
    if (this.cursor) {
      let tileX = Math.floor(e.data.global.x / TILE_SIZE);
      let tileY = Math.floor(e.data.global.y / TILE_SIZE);

      // hide the cursor if it goes off-screen
      if (tileX >= this.tilesWide || tileY >= this.tilesHigh) {
        tileX = -TILE_SIZE;
        tileY = -TILE_SIZE;
      }

      this.cursor.x = tileX * TILE_SIZE;
      this.cursor.y = tileY * TILE_SIZE;
    }

  }
}
