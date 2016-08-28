import {Component, Input, ViewChild, ElementRef, OnInit} from "@angular/core";

@Component({
  selector: 'context-menu',
  host: {
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

  public isVisible(): boolean {
    return this.visible;
  }

  public show(x: number, y: number): void {
    if (!this.visible) {
      this.menuTop = y + 'px';
      this.menuLeft = x + 'px';
      this.display = 'block';
      this.visible = true;
    }
  }

  public hide(): void {
    if (this.visible) {
      this.display = 'none';
      this.visible = false;
    }
  }

  private onContextMenu($event): boolean {
    return false;
  }
}
