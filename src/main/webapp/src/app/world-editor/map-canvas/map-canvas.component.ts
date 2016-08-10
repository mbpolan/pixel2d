import {OnInit, TemplateRef, ViewContainerRef, ViewChild, ElementRef, Component} from "@angular/core";
import {ScrollBar, SCROLL_SIZE} from "./scrollbar";

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

  private scrollX: ScrollBar;
  private scrollY: ScrollBar;

  private canvas: PIXI.Container;
  private canvasWidth: number;
  private canvasHeight: number;
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

      this.stage = new PIXI.Container();

      // create a new stage and size it to contain the amount of tiles
      this.canvas = new PIXI.Container();
      this.canvasWidth = width * TILE_SIZE;
      this.canvasHeight = height * TILE_SIZE;

      this.stage.addChild(this.canvas);

      // create a set of scrollbars across the x and y axis
      this.scrollY = new ScrollBar(true, this.stage);
      this.scrollY.reshape(this.renderer.width, this.renderer.height - SCROLL_SIZE, this.canvasWidth, this.canvasHeight);
      this.scrollX = new ScrollBar(false, this.stage);
      this.scrollX.reshape(this.renderer.width - SCROLL_SIZE, this.renderer.height, this.canvasWidth, this.canvasHeight);

      // and ask to be notified of any changes to the scroll positions
      this.scrollY.scrolled$.subscribe((pct) => this.onScroll(pct, true));
      this.scrollX.scrolled$.subscribe((pct) => this.onScroll(pct, false));

      // create grid lines for the map
      this.gridLines = this.createGridLines();

      // create a new tile cursor
      this.cursor = this.createCursor();

      // set the stage to be interactive and track mouse movements
      this.canvas.interactive = true;
      this.canvas.on('mousemove', (e) => this.onMouseMove(e));

      this.renderLoop();
    }

    else {
      // FIXME: handle resizing
      this.canvas.removeChildren();
    }

    // always add the cursor to the stage
    this.canvas.addChild(this.gridLines);
    this.canvas.addChild(this.cursor);
  }

  /**
   * Handler invoked when a scrollbar has been moved.
   *
   * @param pct The percentage of the total view that was scrolled.
   * @param vertical true if this is the vertical scrollbar, false for horizontal.
   */
  private onScroll(pct: number, vertical: boolean): void {
    if (vertical) {
      this.canvas.y = -(this.canvasHeight * pct);
    }

    else {
      this.canvas.x = -(this.canvasWidth * pct);
    }
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
      // factor in the scroll offset when computing what tile we are hovering over
      let tileX = Math.floor((Math.abs(this.canvas.x) + e.data.global.x) / TILE_SIZE);
      let tileY = Math.floor((Math.abs(this.canvas.y) + e.data.global.y) / TILE_SIZE);

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
