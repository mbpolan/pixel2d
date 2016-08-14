import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {OnInit} from "@angular/core";

@Injectable()
export class AppActions {

  private newMapAction = new Subject<any>();
  private toggleGridLinesActions = new Subject<boolean>();

  public newMap$ = this.newMapAction.asObservable();
  public toggleGridLines$ = this.toggleGridLinesActions.asObservable();

  public newMap(): void {
    this.newMapAction.next('newMap');
  }

  public toggleGridLines(shown: boolean): void {
    this.toggleGridLinesActions.next(shown);
  }
}
