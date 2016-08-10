/**
 * Class that models a tileset loaded from an image.
 */
export class Tileset {
  public constructor(public image: string, public tiles: TileAsset[]) {}
}

/**
 * Class that models tile assets grouped by prefix.
 */
export class TileAsset {
  public constructor(public prefix: string, public textures: Tile[]) { }
}

/**
 * Class that models a single tile im a larger tileset.
 */
export class Tile {
  public constructor(public id: number, public name: string, public x: number, public y: number) {}
}
