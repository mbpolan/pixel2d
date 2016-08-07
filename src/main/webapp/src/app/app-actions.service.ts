import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {OnInit} from "@angular/core";

@Injectable()
export class AppActions {

  private newMapAction = new Subject<any>();

  public newMap$ = this.newMapAction.asObservable();

  public newMap(): void {
    this.newMapAction.next('newMap');
  }
}
