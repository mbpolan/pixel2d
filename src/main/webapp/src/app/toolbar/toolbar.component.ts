import {Component, ViewChild, ViewContainerRef} from "@angular/core";
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS, ModalDirective} from "ng2-bootstrap";
import {AppActions} from "../app-actions.service";
import {BrushMode} from "../world-editor/map-canvas/brush";

/**
 * Class that represents a single drawing tool on the toolbar.
 */
class ToolItem {
  public constructor(public mode: BrushMode,
                     public icon: string,
                     public tooltip: string,
                     public active: boolean) {

  }
}

@Component({
  selector: 'toolbar',
  styleUrls: ['./toolbar.style.css'],
  templateUrl: './toolbar.template.html'
})
export class ToolbarComponent {

  private showGridLines: boolean = true;
  private tools: ToolItem[] = [
    new ToolItem(BrushMode.Pencil, 'glyphicon-pencil', 'Pencil tool', true),
    new ToolItem(BrushMode.Fill, 'glyphicon-tint', 'Fill area tool', false),
    new ToolItem(BrushMode.Eraser, 'glyphicon-erase', 'Eraser tool', false)
  ];

  public constructor(private appActions: AppActions) {
  }

  /**
   * Handler invoked when the drawing tool was changed.
   *
   * @param selected The newly chosen tool.
   */
  private onToolSelected(selected: ToolItem): void {
    selected.active = !selected.active;

    for (let tool of this.tools) {
      if (tool != selected) {
        tool.active = (tool === selected);
      }
    }

    let activeTool = this.tools.find(tool => tool.active);
    this.appActions.changeBrushMode(activeTool ? activeTool.mode : BrushMode.None);
  }

  /**
   * Handler invoked when the grid lines toggle has been selected.
   */
  private onToggleGridLines(): void {
    this.showGridLines = !this.showGridLines;
    this.appActions.toggleGridLines(this.showGridLines);
  }

  /**
   * Handler invoked when the user clicks the New button.
   */
  private onShowNewModal(): void {
    this.appActions.newMap();
  }
}
