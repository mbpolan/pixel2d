import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {OnInit} from "@angular/core";
import {BrushMode} from "./world-editor/map-canvas/brush";

export class BrushModeToggle {
  public constructor(public mode: BrushMode, public enabled: boolean) {}
}

@Injectable()
export class AppActions {

  private newMapAction = new Subject<any>();
  private toggleGridLinesActions = new Subject<boolean>();
  private brushModeChangedAction = new Subject<BrushMode>();
  private toggleBrushModeAction = new Subject<BrushModeToggle>();

  public newMap$ = this.newMapAction.asObservable();
  public toggleGridLines$ = this.toggleGridLinesActions.asObservable();
  public brushModeChanged$ = this.brushModeChangedAction.asObservable();
  public toggleBrushMode$ = this.toggleBrushModeAction.asObservable();

  public newMap(): void {
    this.newMapAction.next('newMap');
  }

  public toggleGridLines(shown: boolean): void {
    this.toggleGridLinesActions.next(shown);
  }

  public changeBrushMode(mode: BrushMode): void {
    this.brushModeChangedAction.next(mode);
  }

  public toggleBrushMode(mode: BrushMode, enabled: boolean): void {
    this.toggleBrushModeAction.next(new BrushModeToggle(mode, enabled));
  }
}
