import {Component} from '@angular/core'

@Component({
  selector: 'status-bar',
  styleUrls: ['./status-bar.style.css'],
  templateUrl: './status-bar.template.html'
})
export class StatusBarComponent {

  private cursorX: number = 0;
  private cursorY: number = 0;

  /**
   * Sets the position of the cursor on the map.
   *
   * @param x The coordinate of the tile on the x-axis.
   * @param y The coordinate of the tile on the y-axis.
   */
  public setCursor(x: number, y: number): void {
    this.cursorX = x;
    this.cursorY = y;
  }
}
