import {Tile, Tileset, Entity} from "../tileset";

/**
 * Class that represents a single tile on the map.
 */
export class MapTile {

  /**
   * Creates a new map tile bean.
   *
   * @param sprite The graphic that draws this tile.
   * @param tileset The tileset the tile belongs to.
   * @param tile The tile itself.
   */
  public constructor(public sprite: PIXI.Container,
                     public tileset: Tileset,
                     public tile: Tile) {
  }
}

/**
 * Class that represents a single sprite on the map.
 */
export class MapSprite extends PIXI.Container {

  private bb: PIXI.Graphics;

  /**
   * Creates a new map sprite bean.
   *
   * @param sprite The graphic that draws this sprite.
   * @param tileset The tileset the sprite belongs to.
   * @param entity The sprite itself.
   */
  public constructor(public sprite: PIXI.Container,
                     public tileset: Tileset,
                     public entity: Entity) {
    super();
    super.addChild(sprite);

    // draw the bounding box in a faint color
    this.bb = new PIXI.Graphics();
    this.bb.beginFill(0xFF0000, 0.25);
    this.bb.drawRect(this.entity.box.x, this.entity.box.y, this.entity.box.w, this.entity.box.h);
    this.bb.endFill();
  }

  /**
   * Toggles whether the sprite's bounding box is drawn or not.
   *
   * @param yes true to draw, false to not draw.
   */
  public showBoundingBox(yes: boolean): void {
    yes ? super.addChild(this.bb) : super.removeChild(this.bb);
  }
}
