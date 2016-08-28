import {Entity} from "../tileset";
import * as _ from 'lodash';
import {MapSprite} from "./elements";

/**
 * Manager for sprites placed on the map.
 */
export class SpriteManager {

  private boundingBoxesShown = false;
  private map: MapSprite[][][];

  /**
   * Creates a new sprite manager.
   *
   * @param width The width of the map, in tiles.
   * @param height The height of the map, in tiles.
   * @param tileSize The pixel size of each tile.
   */
  public constructor(private width: number, private height: number, private tileSize: number) {
    this.map = [];

    for (let i = 0; i < width; i++) {
      this.map[i] = [];
    }
  }

  /**
   * Adds a sprite to the stop of the stack at the given location.
   *
   * @param x The x-coordinate of the tile.
   * @param y The y-coordinate of the tile.
   * @param sprite The sprite to add.
   */
  public push(x: number, y: number, sprite: MapSprite): void {
    if (!this.map[x][y]) {
      this.map[x][y] = [];
    }

    this.map[x][y].push(sprite);

    // show the sprite's bounding box if the option is currently enabled
    sprite.showBoundingBox(this.boundingBoxesShown);
  }

  /**
   * Returns the topmost sprite at the given location.
   *
   * @param x The x-coordinate of the tile.
   * @param y The y-coordinate of the tile.
   * @returns The topmost sprite, or null if there is no sprite at this location.
   */
  public peek(x: number, y: number): MapSprite {
    let stack = this.map[x][y];
    return stack ? _.head(stack) : null;
  }

  /**
   * Removes the topmost sprite at the given location and returns it.
   *
   * @param x The x-coordinate of the tile.
   * @param y The y-coordinate of the tile.
   * @returns The topmost sprite, or null if there is no sprite at this location.
   */
  public pop(x: number, y: number): MapSprite {
    let stack = this.map[x][y];
    return stack && !_.isEmpty(stack) ? stack.pop() : null;
  }

  /**
   * Toggles whether or not sprites should draw their bounding boxes.
   *
   * This will cause all sprites to be redrawn.
   *
   * @param enabled true to draw, false to not draw.
   */
  public toggleBoundingBoxes(enabled: boolean): void {
    this.boundingBoxesShown = enabled;
    this.forEachSprite(sprite => sprite.showBoundingBox(enabled));
  }

  /**
   * Returns a list of sprites that are found under the given canvas coordinates.
   *
   * @param x The x-coordintae of the canvas.
   * @param y The y-coordinate of the canvas.
   * @returns The sprites whose area appears under the point.
   */
  public spritesUnder(x: number, y: number): Array<MapSprite> {
    let matches = [];

    // preallocate a rectangle so we don't keep creating new rectangles for each sprite bounds computation
    let rect = new PIXI.Rectangle();

    this.forEachSprite(s => {
      if (s.getBounds(true, rect).contains(x, y)) {
        matches.push(s);
      }
    });

    return matches;
  }

  /**
   * Determines if a given sprite collides with another sprite.
   *
   * @param pos The intended position of the incoming sprite.
   * @param sprite The sprite to test.
   * @returns true if there is at least one collision, false if none.
   */
  public collides(pos: PIXI.Point, sprite: Entity): boolean {
    // sprites without a bounding box can never collide with another sprite
    if (!sprite.box) {
      return false;
    }

    let ab = sprite.box;
    let tx = pos.x * this.tileSize;
    let ty = pos.y * this.tileSize;

    // for each row in the map
    return !_.isEmpty(this.map.find(r => {

      // for each column in this row
      for (let c in r) {
        if (r.hasOwnProperty(c)) {

          // find a sprite in this position that might collide
          let collides = _.find(r[c], other => {
            let b = other.position;
            let bb = other.entity.box;

            // axis-aligned bounding box collision detection
            return bb && !!(tx < b.x + bb.x + bb.w &&
            tx + ab.x + ab.w > b.x + bb.x &&
            ty < b.y + bb.y + bb.h &&
            ty + ab.y + ab.h > b.y + bb.y);
          });

          // fast fail if a collision is found
          if (collides) {
            return true;
          }
        }
      }

      return false;
    }));
  }

  /**
   * Invokes a function on each sprite in the map.
   *
   * @param f The function to invoke.
   */
  private forEachSprite(f: (MapSprite) => void): void {
    this.map.forEach(r => {
      for (let c in r) {
        if (r.hasOwnProperty(c) && r[c]) {
          r[c].forEach(f);
        }
      }
    });
  }
}
