import {Component, ViewChild, ViewContainerRef} from "@angular/core";
import {MODAL_DIRECTIVES, BS_VIEW_PROVIDERS, ModalDirective} from "ng2-bootstrap";
import {AppActions, BrushModeToggle} from "../app-actions.service";
import {BrushMode} from "../world-editor/map-canvas/brush";

/**
 * Class that represents a single drawing tool on the toolbar.
 */
class ToolItem {
  public constructor(public mode: BrushMode,
                     public icon: string,
                     public tooltip: string,
                     public active: boolean,
                     public enabled: boolean = true) {}
}

@Component({
  selector: 'toolbar',
  styleUrls: ['./toolbar.style.css'],
  templateUrl: './toolbar.template.html'
})
export class ToolbarComponent {

  private showGridLines: boolean = true;
  private tools: ToolItem[] = [
    new ToolItem(BrushMode.None, 'glyphicon-hand-up', 'Pointer tool', false),
    new ToolItem(BrushMode.Pencil, 'glyphicon-pencil', 'Pencil tool', true),
    new ToolItem(BrushMode.Fill, 'glyphicon-tint', 'Fill area tool', false),
    new ToolItem(BrushMode.Eraser, 'glyphicon-erase', 'Eraser tool', false)
  ];

  public constructor(private appActions: AppActions) {
    appActions.toggleBrushMode$.subscribe((toggle: BrushModeToggle) => {
      // find the tool in question and enable or disable it
      let tool = this.tools.find(t => t.mode === toggle.mode);
      tool.enabled = toggle.enabled;

      // if the tool was the currently selected one and its now disabled, choose another tool
      if (tool.active && !toggle.enabled) {
        this.onToolSelected(this.tools.find(t => t.enabled));
      }
    });
  }

  /**
   * Handler invoked when the drawing tool was changed.
   *
   * @param selected The newly chosen tool.
   */
  private onToolSelected(selected: ToolItem): void {
    if (selected.enabled) {
      selected.active = !selected.active;

      // disable all other tools
      for (let tool of this.tools) {
        if (tool != selected) {
          tool.active = (tool === selected);
        }
      }

      // if all tools have been unselected, then select the pointer tool as the default
      if (this.tools.filter(tool => tool.active).length === 0) {
        this.tools[0].active = true;
      }

      let activeTool = this.tools.find(tool => tool.active);
      this.appActions.changeBrushMode(activeTool ? activeTool.mode : BrushMode.None);
    }
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
