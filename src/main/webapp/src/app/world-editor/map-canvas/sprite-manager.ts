import {Entity} from "../tileset";
import * as _ from 'lodash';
import {MapSprite} from "./elements";

/**
 * Manager for sprites placed on the map.
 */
export class SpriteManager {

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
   * Determines if a given sprite collides with another sprite.
   *
   * @param pos The intended position of the incoming sprite.
   * @param sprite The sprite to test.
   * @returns true if there is at least one collision, false if none.
   */
  public collides(pos: PIXI.Point, sprite: Entity): boolean {
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
            return !!(tx < b.x + bb.x + bb.w &&
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
}
