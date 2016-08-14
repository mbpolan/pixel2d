import {OnInit, TemplateRef, ViewContainerRef, ViewChild, ElementRef, Component, OnDestroy} from "@angular/core";
import {ScrollBar, SCROLL_SIZE} from "./scrollbar";
import {Subject, Observable, Subscription} from "rxjs";
import {Point2D} from "../point2d";
import {TimerObservable} from "rxjs/observable/TimerObservable";
import {Tileset, Tile, Entity} from "../tileset";
import {Brush, BrushMode} from "./brush";
import {Cursor} from "./cursor";

// the size of a single tile in pixels
const TILE_SIZE = 16;

class MapTile {

  public constructor(public sprite: PIXI.DisplayObject,
                     public tileset: Tileset,
                     public tile: Tile) {
  }
}

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
  private zoom: number;
  private canvasWidth: number;
  private canvasHeight: number;
  private tiles: MapTile[][];

  // extra elements and overlays on the canvas
  private gridLinesShown: boolean;
  private gridLines: PIXI.Container;
  private cursor: Cursor;

  // size of the map in tiles
  private tilesWide: number;
  private tilesHigh: number;

  // brushes
  private brush: Brush;
  private continuousDraw: boolean;
  private lastDrawPoint: PIXI.Point;

  // location of map cursor and observable for notifications
  private cursorPos: Point2D;
  private cursorAction = new Subject<Point2D>();
  public cursorUpdated$ = this.cursorAction.asObservable();

  public constructor() {
    this.brush = new Brush();
    this.continuousDraw = false;
    this.gridLinesShown = true;
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

      // set the initialize zoom level on the canvas and compute its dimensions
      this.zoom = 2;
      this.updateCanvasSize();

      // create a new stage and size it to contain the amount of tiles
      this.canvas = new PIXI.Container();
      this.canvas.scale.set(this.zoom, this.zoom);
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
      this.cursor = new Cursor(TILE_SIZE);
      this.cursorPos = new Point2D(1, 1);

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
    this.canvas.addChild(this.cursor);
    this.canvas.addChild(this.gridLines);

    // initialize the map of references to tiles
    this.tiles = [];
    for (let i = 0; i < this.tilesWide; i++) {
      this.tiles[i] = [];
    }

    // refresh all editor features at this point
    this.updateEditor();
  }

  /**
   * Shows or hides the canvas grid lines.
   *
   * @param shown true to show the gridlines, false to hide.
   */
  public setGridLinesShown(shown: boolean) {
    if (this.gridLines) {
      this.gridLinesShown = shown;
      shown ? this.canvas.addChild(this.gridLines) : this.canvas.removeChild(this.gridLines);
    }
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
   * Sets the sprite to use as the canvas brush.
   *
   * @param tileset The tileset the sprite belongs to.
   * @param sprite The sprite.
   */
  public setSpriteBrush(tileset: Tileset, sprite: Entity): void {
    this.brush.setSprite(tileset, sprite);
  }

  /**
   * Sets the mode in which the current brush operates.
   *
   * @param mode The draw mode of the current brush.
   */
  public setBrushMode(mode: BrushMode): void {
    this.brush.setMode(mode);
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
   * Handler invoked when the mouse wheel is moved.
   *
   * @param e The native mouse wheel event.
   */
  private onMouseWheel(e: WheelEvent): void {
    let delta = (e.wheelDelta / Math.abs(e.wheelDelta));

    // prevent scaling the canvas to be too small
    if (this.canvas && this.zoom + delta >= 1) {
      this.zoom += delta;

      // scale the canvas, recompute its dimensions and update the editor
      this.canvas.scale.set(this.zoom, this.zoom);
      this.updateCanvasSize();
      this.updateEditor();
    }
  }

  /**
   * Handler invoked when the mouse button is pressed.
   *
   * @param e The native mouse event.
   */
  private onMouseDown(e: any): void {
    if (this.brush.isValid()) {
      // continuous drawing is only supported for pencil and eraser tools
      let mode = this.brush.getMode();
      this.continuousDraw = mode === BrushMode.Pencil || mode === BrushMode.Eraser;

      this.drawAt(this.getTilePosition(e.data.global.x, e.data.global.y));
    }
  }

  /**
   * Handler invoked when the mouse button is released.
   */
  private onMouseUp(): void {
    this.continuousDraw = false;
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
    if (this.continuousDraw) {
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
      Math.floor((Math.abs(this.canvas.x) + x) / (TILE_SIZE * this.zoom)),
      Math.floor((Math.abs(this.canvas.y) + y) / (TILE_SIZE * this.zoom)));
  }

  private getViewableArea(): PIXI.Rectangle {
    let scale = this.zoom * TILE_SIZE;

    let x = Math.floor(Math.abs(this.canvas.x) / scale);
    let y = Math.floor(Math.abs(this.canvas.y) / scale);

    let w = Math.floor(Math.min(this.tilesWide * scale, this.renderer.width) / scale);
    let h = Math.floor(Math.min(this.tilesHigh * scale, this.renderer.height) / scale);

    return new PIXI.Rectangle(x, y, w, h);
  }

  /**
   * Performs a draw operation starting at the given position.
   *
   * Depending on the current brush mode, the actual area drawn may be larger than
   * just the tile under the given point.
   *
   * @param pos The position to draw at.
   */
  private drawAt(pos: PIXI.Point): void {
    switch (this.brush.getMode()) {
      case BrushMode.Pencil:
        this.brush.isTile() ? this.placeTile(pos) : this.placeSprite(pos);
        break;

      case BrushMode.Fill:
        if (!this.brush.isTile()) {
          throw new Error('Cannot use fill mode when drawing sprites')
        }

        this.fillTiles(pos);
        break;

      case BrushMode.Eraser:
        this.brush.isTile() ? this.eraseTile(pos) : null;
        break;

      default:
        break;
    }
  }

  /**
   * Draws over a region of tiles that match the tile under the given position.
   *
   * If the starting position has no tile, then all empty tiles that border this one will
   * be painted over.
   *
   * @param pos The tile coordinates of the starting tile.
   */
  private fillTiles(pos: PIXI.Point): void {
    // draw the tile at this position regardless
    let thisTile = this.tiles[pos.x][pos.y];
    this.placeTile(pos);

    // define a function to check if a tile is a candidate for the fill algorithm
    let sameAs = (pt: PIXI.Point): boolean => {
      let other = this.tiles[pt.x][pt.y];

      return ((!other && !thisTile) || (other && thisTile &&
          (other.tileset == thisTile.tileset && other.tile === thisTile.tile)));
    };

    // compute the bounds to be restricted to the area the user can currently see
    let bounds = this.getViewableArea();

    let stack: PIXI.Point[] = [pos];
    while (stack.length > 0) {
      let p = stack.pop();
      let neighbors = [new PIXI.Point(p.x, p.y - 1), new PIXI.Point(p.x - 1, p.y),
                       new PIXI.Point(p.x + 1, p.y) , new PIXI.Point(p.x, p.y + 1)];

      for (let n of neighbors) {
        // if the point is valid and its the same as the source tile, then draw over it and examine
        // its neighbors in turn
        if (bounds.contains(n.x, n.y) && sameAs(n)) {
          this.placeTile(n);
          stack.push(n);
        }
      }
    }

    this.afterDraw();
  }

  /**
   * Removes a tile at the given tile coordinates.
   *
   * @param pos The tile coordinates to erase at.
   */
  private eraseTile(pos: PIXI.Point): void {
    let tile = this.tiles[pos.x][pos.y];
    if (tile) {
      this.canvas.removeChild(tile.sprite);
      delete this.tiles[pos.x][pos.y];
    }
  }

  /**
   * Draws the current brush at the given tile coordinates.
   *
   * @param pos The tile coordinates to draw on.
   */
  private placeTile(pos: PIXI.Point): void {
    if ((!this.lastDrawPoint || (this.lastDrawPoint.x !== pos.x || this.lastDrawPoint.y !== pos.y)) &&
      (pos.x >= 0 && pos.x < this.tilesWide) && (pos.y >= 0 && pos.y < this.tilesHigh)) {

      // render the tile and place it on the canvas
      let sprite = this.brush.paint();
      sprite.x = pos.x * TILE_SIZE;
      sprite.y = pos.y * TILE_SIZE;

      // if there is already a tile at this position, remove it prior to add the new one
      let oldTile = this.tiles[pos.x][pos.y];
      if (oldTile && (oldTile.tileset !== this.brush.getTileset() || oldTile.tile !== this.brush.getTile())) {
        this.canvas.removeChild(this.tiles[pos.x][pos.y].sprite);
      }

      this.canvas.addChild(sprite);
      this.tiles[pos.x][pos.y] = new MapTile(sprite, this.brush.getTileset(), this.brush.getTile());
      this.lastDrawPoint = pos;

      this.afterDraw();
    }
  }

  /**
   * Draws the current brush's sprite at the given tile coordinates.
   *
   * @param pos The tile coordinates to draw on.
   */
  private placeSprite(pos: PIXI.Point): void {
    let sprite = this.brush.paint();
    sprite.x = pos.x * TILE_SIZE;
    sprite.y = pos.y * TILE_SIZE;

    // FIXME: this needs to go on its own layer
    this.canvas.addChild(sprite);
    this.afterDraw();
  }

  /**
   * Performs some finishing touches after the canvas has been draw on.
   */
  private afterDraw(): void {
    this.canvas.addChild(this.cursor);

    // move the cursor gridlines to the top of the stack
    if (this.gridLinesShown) {
      this.canvas.addChild(this.gridLines);
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
   * Recomputes the size of the canvas.
   */
  private updateCanvasSize(): void {
    this.canvasWidth = this.tilesWide * TILE_SIZE * this.zoom;
    this.canvasHeight = this.tilesHigh * TILE_SIZE * this.zoom;
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
