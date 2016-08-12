import {Component, AfterViewInit, ViewChild, OnDestroy} from "@angular/core";
import {NGB_TABSET_DIRECTIVES} from "@ng-bootstrap/ng-bootstrap";
import {MapCanvasComponent} from "./map-canvas/map-canvas.component";
import {TAB_DIRECTIVES} from "ng2-bootstrap";
import {WorldActions} from "./world-actions.service";
import {MapDetails} from "../map-details";
import {StatusBarComponent} from "./status-bar/status-bar.component";
import {Cursor} from "./cursor";
import {TilesetService} from "./tileset.service";
import {Tile, Tileset} from "./tileset";

@Component({
  selector: 'world-editor',
  directives: [TAB_DIRECTIVES, MapCanvasComponent, StatusBarComponent],
  providers: [TilesetService],
  styleUrls: ['./world-editor.style.css'],
  templateUrl: './world-editor.template.html'
})
export class WorldEditorComponent implements AfterViewInit {

  @ViewChild(MapCanvasComponent)
  private mapCanvas: MapCanvasComponent;

  @ViewChild(StatusBarComponent)
  private statusBar: StatusBarComponent;

  private tilesets: Tileset[];
  private selectedTileset: Tileset;
  private selectedTile: Tile;

  public constructor(private tilesetService: TilesetService, private worldActions: WorldActions) {
    worldActions.initializeNew$.subscribe(details => this.initializeNew(details));
  }

  /**
   * Handler invoked when all child views have been initialized.
   */
  public ngAfterViewInit(): void {
    // listen for cursor movements and update them on the status bar
    this.mapCanvas.cursorUpdated$.subscribe((c: Cursor) => this.statusBar.setCursor(c.x, c.y));

    // request tilesets that we can show the user
    this.tilesetService.getTilesets().subscribe((tilesets: Tileset[]) => {
      this.tilesets = tilesets;
      console.log(tilesets);

      // show the first tileset
      if (this.tilesets.length > 0) {
        this.onTilesetChanged(this.tilesets[0].assets.name);
      }
    })
  }

  /**
   * Handler invoked when the current tileset is changed.
   *
   * @param name The name of the newly selected tileset.
   */
  private onTilesetChanged(name: any): void {
    this.selectedTileset = this.tilesets.find((t) => t.assets.name === name);
  }

  /**
   * Handler invoked when the user picks a tile.
   *
   * @param tile The chosen tile.
   */
  private onTileSelected(tile: Tile): void {
    this.selectedTile = tile;
    this.mapCanvas.setTileBrush(this.selectedTileset, tile);
  }

  /**
   * Destroys the world definition and starts a new one.
   *
   * @param details Information about the new map.
   */
  private initializeNew(details: MapDetails): void {
    this.mapCanvas.initialize(details.width, details.height);
  }
}
