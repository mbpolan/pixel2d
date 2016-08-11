import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Tileset, Assets} from "./tileset";

@Injectable()
export class TilesetService {

  // mock a tileset that's served up locally
  private file = 'hyrule_tileset';

  public constructor(private http: Http) { }

  /**
   * Return a collection of tilesets supported by the editor.
   *
   * @returns {Promise<Tileset[]>} Promise resolved to a collection of tilesets.
   */
  public getTilesets(): Promise<Tileset[]> {
    return this.http.get('/assets/mock/' + this.file + '.json').toPromise().then(response => {
      return [new Tileset(this.file + '.png', response.json() as Assets)];
    });
  }
}
