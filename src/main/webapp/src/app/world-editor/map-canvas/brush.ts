import {Tileset, Tile} from "../tileset";

/**
 * Enumeration of possible brush drawing modes.
 */
export enum BrushMode {
  Pencil,
  Fill
}

/**
 * Definition of a brush used to draw on the canvas.
 */
export class Brush {

  private mode: BrushMode;
  private tileset: Tileset;
  private tile: Tile;

  public constructor() {
    this.mode = BrushMode.Pencil;
  }

  /**
   * Sets the mode in which this brush operates.
   *
   * @param mode The drawing mode.
   */
  public setMode(mode: BrushMode): void {
    this.mode = mode;
  }

  /**
   * Returns the mode in which this brush operates.
   *
   * @returns {BrushMode} The drawing mode.
   */
  public getMode(): BrushMode {
    return this.mode;
  }

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
   * Returns a reference to the tileset for the brush.
   *
   * @returns {Tileset} The tileset for the brush.
   */
  public getTileset(): Tileset {
    return this.tileset;
  }

  /**
   * Returns a reference to the tile for the brush.
   *
   * @returns {Tile} The tile for the brush.
   */
  public getTile(): Tile {
    return this.tile;
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
    let spr = new PIXI.Sprite(new PIXI.Texture(
      PIXI.utils.TextureCache['/assets/' + this.tileset.image],
      new PIXI.Rectangle(this.tile.x, this.tile.y, this.tileset.assets.tiles.w, this.tileset.assets.tiles.h)));

    spr.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    return spr;
  }
}
