import {Tileset, Tile, Entity} from "../tileset";

/**
 * Enumeration of possible brush drawing modes.
 */
export enum BrushMode {
  None,
  Pencil,
  Fill,
  Eraser
}

/**
 * Definition of a brush used to draw on the canvas.
 */
export class Brush {

  private mode: BrushMode;
  private tileset: Tileset;
  private tile: Tile;
  private sprite: Entity;

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
    this.sprite = null;
  }

  /**
   * Sets the sprite to use for the brush.
   *
   * @param tileset The tileset that the sprite comes from.
   * @param sprite The sprite.
   */
  public setSprite(tileset: Tileset, sprite: Entity): void {
    this.tileset = tileset;
    this.sprite = sprite;
    this.tile = null;
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
   * Returns a reference to the sprite for the brush.
   *
   * @returns {Entity} The sprite for the brush.
   */
  public getSprite(): Entity {
    return this.sprite;
  }

  /**
   * Determines whether the brush is drawing tiles or sprites.
   *
   * @returns {boolean} true if tiles are to be drawn, false if sprites.
   */
  public isTile(): boolean {
    return this.tile !== null;
  }

  /**
   * Determines whether the brush is configured to draw.
   *
   * @returns {boolean} true if ready to draw, false if not.
   */
  public isValid(): boolean {
    return this.tileset !== null && (this.tile !== null || this.sprite !== null);
  }

  /**
   * Renders a sprite represented by the brush configuration.
   *
   * @returns {PIXI.Container} The rendered sprite.
   */
  public paint(): PIXI.Container {
    let gfx: PIXI.Sprite;
    let baseTexture = PIXI.utils.TextureCache['/assets/' + this.tileset.image];

    // draw a tile graphic
    if (this.tile) {
      gfx = new PIXI.Sprite(new PIXI.Texture(
        baseTexture,
        new PIXI.Rectangle(this.tile.x, this.tile.y, this.tileset.assets.tiles.w, this.tileset.assets.tiles.h)));
    }

    // otherwise draw a sprite graphic
    else {
      gfx = new PIXI.Sprite(new PIXI.Texture(
        baseTexture,
        new PIXI.Rectangle(this.sprite.x, this.sprite.y, this.sprite.w, this.sprite.h)));
    }

    // use a crisper scaling mode than the default
    gfx.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    return gfx;
  }
}
