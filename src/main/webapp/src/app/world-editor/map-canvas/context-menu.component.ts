import {Component, Input, ViewChild, ElementRef, OnInit} from "@angular/core";
import {MapSprite} from "./elements";

@Component({
  selector: 'context-menu',
  host: {
    '(document: click)': 'onDocumentClick($event)',
    '[style.display]': 'display',
    '[style.top]': 'menuTop',
    '[style.left]': 'menuLeft',
  },
  styleUrls: ['./context-menu.style.css'],
  templateUrl: './context-menu.template.html'
})
export class ContextMenuComponent {

  private menuTop: string = '0';
  private menuLeft: string = '0';
  private display: string = 'none';
  private visible: boolean = false;
  private sprites: Array<MapSprite> = [];

  public constructor(private element: ElementRef) {

  }

  /**
   * Returns whether the context menu is shown or not.
   *
   * @returns true if shown, false if not.
   */
  public isVisible(): boolean {
    return this.visible;
  }

  /**
   * Displays the context menu at the given canvas coordinates.
   *
   * @param x The x-coordinate of the canvas.
   * @param y The y-coordinate of the canvas.
   * @param sprites List of sprites that appear under the cursor.
   */
  public show(x: number, y: number, sprites: Array<MapSprite>): void {
    if (!this.visible) {
      this.menuTop = (y + 1) + 'px';
      this.menuLeft = (x + 1) + 'px';
      this.display = 'block';
      this.visible = true;
      this.sprites = sprites;
    }
  }

  /**
   * Hides a previously shown context menu.
   */
  public hide(): void {
    if (this.visible) {
      this.display = 'none';
      this.visible = false;
    }
  }

  /**
   * Handler invoked when a mouse click was done against the document.
   *
   * @param e The native mouse event.
   */
  private onDocumentClick(e: MouseEvent): void {
    // FIXME: this really should use something like Renderer but the docs don't have a good approach
    if (this.visible && e.target !== this.element.nativeElement && !this.element.nativeElement.contains(e.target)) {
      this.hide();
    }
  }
}
