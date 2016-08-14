/**
 * Class that models a tileset loaded from an image.
 */
export class Tileset {
  public constructor(public image: string,
                     public assets: Assets) {}
}

/**
 * Class that models various graphical assets associated with a tileset.
 */
export class Assets {
  public constructor(public name: string,
                     public tiles: TileAsset,
                     public entities: Entity) {}
}

/**
 * Class that models tile assets in a tileset.
 */
export class TileAsset {
  public constructor(public w: number,
                     public h: number,
                     public textures: Tile[]) {}
}

/**
 * Class that models a single tile im a larger tileset.
 */
export class Tile {
  public constructor(public id: number,
                     public name: string,
                     public x: number,
                     public y: number) {}
}

export class Box {
  public constructor(public w: number,
                     public h: number,
                     public x: number,
                     public y: number) {}
}

/**
 * Class that models a single entity.
 */
export class Entity {
  public constructor(public id: number,
                     public name: string,
                     public w: number,
                     public h: number,
                     public x: number,
                     public y: number,
                     public box: Box) {}
}
