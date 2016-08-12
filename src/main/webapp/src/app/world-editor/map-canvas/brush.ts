import {Tileset, Tile} from "../tileset";

/**
 * Definition of a brush used to draw on the canvas.
 */
export class Brush {

  private tileset: Tileset;
  private tile: Tile;

  /**
   * Sets the tile to use for the brush.
   *
   * @param tileset The tileset that the tile comes from.
   * @param tile The tile.
   */
  public setTile(tileset: Tileset, tile: Tile): void {
    this.tileset = tileset;
    this.tile = tile;
  }

  /**
   * Determines whether the brush is configured to draw.
   *
   * @returns {boolean} true if ready to draw, false if not.
   */
  public isValid(): boolean {
    return this.tileset !== null && this.tile !== null;
  }

  /**
   * Renders a sprite represented by the brush configuration.
   *
   * @returns {PIXI.Sprite} The rendered sprite.
   */
  public paint(): PIXI.Sprite {
    let baseTexture = PIXI.utils.TextureCache['/assets/' + this.tileset.image];
    return new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(this.tile.x, this.tile.y, 32, 32)));
  }
}
