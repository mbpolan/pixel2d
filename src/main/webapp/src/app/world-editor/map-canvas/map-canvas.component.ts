import {OnInit, TemplateRef, ViewContainerRef, ViewChild, ElementRef, Component} from "@angular/core";
import {ScrollBar, SCROLL_SIZE} from "./scrollbar";
import {Subject} from "rxjs";
import {Cursor} from "../cursor";
import {OnDestroy} from "@angular/core";
import {Observable} from "rxjs";
import {TimerObservable} from "rxjs/observable/TimerObservable";
import {Subscription} from "rxjs";
import {TilesetService} from "../tileset.service";
import {Tileset, Tile} from "../tileset";
import {Brush} from "./brush";

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

  private pendingResize: Subscription;
  private renderer: any;
  private stage: PIXI.Container;

  // scrollbars across the canvas
  private scrollX: ScrollBar;
  private scrollY: ScrollBar;
  private scrollBorder: PIXI.Container;

  // the actual map canvas and its pixel dimensions
  private canvas: PIXI.Container;
  private canvasWidth: number;
  private canvasHeight: number;

  // extra elements and overlays on the canvas
  private gridLines: PIXI.Container;
  private cursor: PIXI.Container;

  // size of the map in tiles
  private tilesWide: number;
  private tilesHigh: number;

  // brushes
  private brush: Brush;
  private drawMode: boolean;
  private lastDrawPoint: PIXI.Point;

  // location of map cursor and observable for notifications
  private cursorPos: Cursor;
  private cursorAction = new Subject<Cursor>();
  public cursorUpdated$ = this.cursorAction.asObservable();

  public constructor() {
    this.brush = new Brush();
    this.drawMode = false;
  }

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
      this.scrollX = new ScrollBar(false, this.stage);

      // create a border to fill in gaps left by the scrollbars
      this.scrollBorder = this.createScrollBorder();
      this.stage.addChild(this.scrollBorder);

      // and ask to be notified of any changes to the scroll positions
      this.scrollY.scrolled$.subscribe((pct) => this.onScroll(pct, true));
      this.scrollX.scrolled$.subscribe((pct) => this.onScroll(pct, false));

      // create grid lines for the map
      this.gridLines = this.createGridLines();

      // create a new tile cursor
      this.cursor = this.createCursor();
      this.cursorPos = new Cursor(1, 1);

      // set the stage to be interactive and track mouse movements
      this.canvas.interactive = true;
      this.canvas.on('mousedown', (e) => this.onMouseDown(e));
      this.canvas.on('mouseup', () => this.onMouseUp());
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

    // refresh all editor features at this point
    this.updateEditor();
  }

  /**
   * Sets the tile to use as the canvas brush.
   *
   * @param tileset The tileset the tile belongs to.
   * @param tile The tile.
   */
  public setTileBrush(tileset: Tileset, tile: Tile): void {
    this.brush.setTile(tileset, tile);
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
   * Handler invoked when a resize event was received.
   *
   * @param e The event.
   */
  private onResize(e: Event): void {
    if (this.renderer) {
      // if there is already a resize pending, unsubscribe from it now
      if (this.pendingResize) {
        this.pendingResize.unsubscribe();
        this.pendingResize = null;
      }

      // schedule another resize to happen in some short time
      this.pendingResize = Observable.timer(500).subscribe(() => {
        // resize the renderer itself and editor elements
        this.updateRenderer();
        this.updateEditor();
      });
    }
  }

  /**
   * Handler invoked when the mouse button is pressed.
   *
   * @param e The native mouse event.
   */
  private onMouseDown(e: any): void {
    if (this.brush.isValid()) {
      this.drawMode = true;

      this.drawAt(this.getTilePosition(e.data.global.x, e.data.global.y));
    }
  }

  /**
   * Handler invoked when the mouse button is released.
   */
  private onMouseUp(): void {
    this.drawMode = false;
    this.lastDrawPoint = null;
  }

  /**
   * Handler invoked when the mouse cursor moves over the canvas.
   *
   * @param e The native mouse event.
   */
  private onMouseMove(e: any): void {
    let pos = this.getTilePosition(e.data.global.x, e.data.global.y);

    // update the cursor position
    if (this.cursor) {
      // hide the cursor if it goes off-screen
      if (pos.x >= this.tilesWide || pos.y >= this.tilesHigh) {
        pos.x = -TILE_SIZE;
        pos.y = -TILE_SIZE;
      }

      this.cursor.x = pos.x * TILE_SIZE;
      this.cursor.y = pos.y * TILE_SIZE;

      // update the cursor location if it has changed
      if (pos.x + 1 !== this.cursorPos.x || pos.y + 1 !== this.cursorPos.y) {
        this.cursorPos.x = pos.x + 1;
        this.cursorPos.y = pos.y + 1;
        this.cursorAction.next(this.cursorPos);
      }
    }

    // if we are currently drawing, trigger another draw now
    if (this.drawMode) {
      this.drawAt(pos);
    }
  }

  /**
   * Translates a local point into tile coordinates.
   *
   * @param x The x local coordinate.
   * @param y The y local coordinate.
   * @returns {PIXI.Point} The translated tile coordinates.
   */
  private getTilePosition(x: number, y: number): PIXI.Point {
    // factor in the scroll offset when computing what tile we are hovering over
    return new PIXI.Point(
      Math.floor((Math.abs(this.canvas.x) + x) / TILE_SIZE),
      Math.floor((Math.abs(this.canvas.y) + y) / TILE_SIZE));
  }

  /**
   * Draws the current brush at the given tile coordinates.
   *
   * @param pos The tile coordinates to draw on.
   */
  private drawAt(pos: PIXI.Point): void {
    if (!this.lastDrawPoint || (this.lastDrawPoint.x !== pos.x || this.lastDrawPoint.y !== pos.y)) {
      // render the tile and place it on the canvas
      let sprite = this.brush.paint();
      sprite.x = pos.x * TILE_SIZE;
      sprite.y = pos.y * TILE_SIZE;

      this.canvas.addChild(sprite);
      this.lastDrawPoint = pos;
    }
  }

  /**
   * Updates the underlying renderer to match the current component size.
   */
  private updateRenderer(): void {
    var rect = this.root.nativeElement.getBoundingClientRect();
    this.renderer.resize(rect.width, rect.height);
  }

  /**
   * Updates various elements on the editor that are dependent on the renderer.
   */
  private updateEditor(): void {
    // update the position of static elements
    this.scrollBorder.x = this.renderer.width - SCROLL_SIZE;
    this.scrollBorder.y = this.renderer.height - SCROLL_SIZE;

    // redraw scrollbars
    this.scrollY.reshape(this.renderer.width, this.renderer.height - SCROLL_SIZE, this.canvasWidth, this.canvasHeight);
    this.scrollX.reshape(this.renderer.width - SCROLL_SIZE, this.renderer.height, this.canvasWidth, this.canvasHeight);
  }

  /**
   * Creates an element for containing the scroll border around the canvas.
   *
   * @returns {PIXI.Graphics} A shape for the border.
   */
  private createScrollBorder(): PIXI.Graphics {
    let g = new PIXI.Graphics();
    g.beginFill(0xEFEFEF);
    g.drawRect(0, 0, SCROLL_SIZE, SCROLL_SIZE);

    return g;
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
}
