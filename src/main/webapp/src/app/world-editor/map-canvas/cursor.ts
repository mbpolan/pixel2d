export class Cursor extends PIXI.Graphics {

  private _radius: number = 1;

  public constructor(private span: number) {
    super();
    this.radius = 1;
  }

  public set radius(value: number) {
    // make sure the radius is an odd number
    this._radius = value % 2 === 0 ? value + 1 : value;

    this.beginFill(0x0077FF, 0.5);
    this.drawRect(0, 0, this._radius * this.span, this._radius * this.span);
    this.endFill();
  }
}
