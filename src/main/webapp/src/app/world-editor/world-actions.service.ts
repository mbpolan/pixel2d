import {Injectable} from '@angular/core'
import {Subject} from "rxjs";
import {MapDetails} from "../map-details";

@Injectable()
export class WorldActions {

  private initializeNewAction = new Subject<MapDetails>();

  public initializeNew$ = this.initializeNewAction.asObservable();

  public initializeNew(details: MapDetails): void {
    this.initializeNewAction.next(details);
  }
}
