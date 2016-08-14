import {ScrollBar} from "./scrollbar";
import {Subject} from "rxjs";

/**
 * Enumeration of possible scrollbar directions.
 */
export enum ScrollDirection {
  Vertical,
  Horizontal
}

/**
 * Event information associated with a scrollbar action.
 */
export class ScrollEvent {
  public constructor(public pct: number, public dir: ScrollDirection) {}
}

/**
 * Component that renders a scrollable area on the canvas.
 */
export class ScrollArea {

  private scrollX: ScrollBar;
  private scrollY: ScrollBar;
  private scrollBorder: PIXI.Container;

  private scrolledAction = new Subject<ScrollEvent>();
  public scrolled$ = this.scrolledAction.asObservable();

  /**
   * Creates a scrollable area.
   *
   * @param scrollSize The size of the scrollbars, in pixels.
   * @param parent The parent container to draw the scrollable area on.
   */
  public constructor(private scrollSize: number, private parent: PIXI.Container) {
    this.scrollY = new ScrollBar(true, parent);
    this.scrollX = new ScrollBar(false, parent);

    // listen for scrollbar movements and propagate them up
    this.scrollY.scrolled$.subscribe(pct => this.scrolledAction.next(
      new ScrollEvent(pct, ScrollDirection.Vertical)));
    this.scrollX.scrolled$.subscribe(pct => this.scrolledAction.next(
      new ScrollEvent(pct, ScrollDirection.Horizontal)));

    this.scrollBorder = this.createScrollBorder();
    parent.addChild(this.scrollBorder);
  }

  /**
   * Redraws the scrollable area to accommodate a new screen and child view size.
   *
   * @param screenWidth The width of the containing parent, in pixels.
   * @param screenHeight The height of the containing parent, in pixels.
   * @param childWidth The width of the contained child view, in pixels.
   * @param childHeight The height of the contained child view, in pixels.
   */
  public update(screenWidth: number, screenHeight: number, childWidth: number, childHeight: number): void {
    this.scrollY.reshape(screenWidth, screenHeight - this.scrollSize, childWidth, childHeight);
    this.scrollX.reshape(screenWidth - this.scrollSize, screenHeight, childWidth, childHeight);

    // update the position of static elements
    this.scrollBorder.x = screenWidth - this.scrollSize;
    this.scrollBorder.y = screenHeight - this.scrollSize;
  }

  /**
   * Creates an element for containing the scroll border around the canvas.
   *
   * @returns {PIXI.Graphics} A shape for the border.
   */
  private createScrollBorder(): PIXI.Graphics {
    let g = new PIXI.Graphics();
    g.beginFill(0xEFEFEF);
    g.drawRect(0, 0, this.scrollSize, this.scrollSize);

    return g;
  }
}
