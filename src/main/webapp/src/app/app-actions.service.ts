import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {OnInit} from "@angular/core";
import {BrushMode} from "./world-editor/map-canvas/brush";

@Injectable()
export class AppActions {

  private newMapAction = new Subject<any>();
  private toggleGridLinesActions = new Subject<boolean>();
  private brushModeChangedAction = new Subject<BrushMode>();

  public newMap$ = this.newMapAction.asObservable();
  public toggleGridLines$ = this.toggleGridLinesActions.asObservable();
  public brushModeChanged$ = this.brushModeChangedAction.asObservable();

  public newMap(): void {
    this.newMapAction.next('newMap');
  }

  public toggleGridLines(shown: boolean): void {
    this.toggleGridLinesActions.next(shown);
  }

  public changeBrushMode(mode: BrushMode): void {
    this.brushModeChangedAction.next(mode);
  }
}
