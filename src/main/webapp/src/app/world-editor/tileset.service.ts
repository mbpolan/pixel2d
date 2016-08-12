import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Tileset, Assets} from "./tileset";
import {Observable} from "rxjs";

@Injectable()
export class TilesetService {

  // mock a tileset that's served up locally
  private file = 'hyrule_tileset';

  public constructor(private http: Http) { }

  /**
   * Return a collection of tilesets supported by the editor.
   *
   * @returns {Observable<Tileset[]>} Observable resolved to a collection of tilesets.
   */
  public getTilesets(): Observable<Tileset[]> {
    return Observable.create((observer) => {
      this.http.get('/assets/mock/' + this.file + '.json').toPromise().then(response => {

        // load textures into the PIXI cache
        PIXI.loader
          .add('/assets/' + this.file + '.png')
          .load(() => {
            observer.next([new Tileset(this.file + '.png', response.json() as Assets)]);
            observer.complete();
          });
      })
    });
  }
}
