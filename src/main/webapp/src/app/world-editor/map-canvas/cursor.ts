import {Entity, Tileset} from "../tileset";

/**
 * Class that represents the cursor on the map.
 */
export class Cursor extends PIXI.Container {

  private radius: number;
  private tile: PIXI.Graphics;
  private sprite: Entity;

  public constructor() {
    super();
    this.tile = new PIXI.Graphics();
    this.radius = 1;
  }

  public setNone(): void {
    this.removeChildren();
  }

  public setTile(span: number): void {
    this.tile.beginFill(0x0077FF, 0.5);
    this.tile.drawRect(0, 0, this.radius * span, this.radius * span);
    this.tile.endFill();

    this.removeChildren();
    this.addChild(this.tile);
  }

  public setSprite(tileset: Tileset, sprite: Entity): void {
    this.sprite = sprite;

    let gfx = new PIXI.Sprite(new PIXI.Texture(
      PIXI.utils.TextureCache['/assets/' + tileset.image],
      new PIXI.Rectangle(sprite.x, sprite.y, sprite.w, sprite.h)));

    // use a crisper scaling mode than the default
    gfx.alpha = 0.75;
    gfx.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    this.removeChildren();
    this.addChild(gfx);
  }
}
