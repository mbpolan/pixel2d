import {Subject} from "rxjs";

// FIXME: externalize scrollbar size
export const SCROLL_SIZE = 15;

/**
 * Container that draws a vertical or horizontal scrollbar.
 */
export class ScrollBar {

  private bar: PIXI.Graphics;
  private thumb: PIXI.Graphics;
  private grab: PIXI.Point;
  private lastMouseEvent: any;
  private max: number;

  private scrollAction = new Subject<number>();
  public scrolled$ = this.scrollAction.asObservable();

  /**
   * Creates a new scrollbar positioned along an axis.
   *
   * @param vertical true for a vertical scrollbar, false for a horizontal.
   * @param parent The parent container to add the scrollbar to.
   */
  public constructor(private vertical: boolean, private parent: PIXI.Container) {
    this.bar = new PIXI.Graphics();
    this.thumb = new PIXI.Graphics();
    this.thumb.interactive = true;

    // listen for mouse events on the thumb
    this.thumb
      .on('mousedown', (e) => this.onDragStart(e))
      .on('touchstart', (e) => this.onDragStart(e))
      .on('mouseup', (e) => this.onDragEnd(e))
      .on('mouseupoutside', (e) => this.onDragEnd(e))
      .on('touchend', (e) => this.onDragEnd(e))
      .on('touchendoutside', (e) => this.onDragEnd(e))
      .on('mousemove', () => this.onDragMove())
      .on('touchmove', () => this.onDragMove());

    this.bar.addChild(this.thumb);
    parent.addChild(this.bar);
  }

  /**
   * Recalculates and redraws the scrollbar to fit its new dimensions.
   *
   * @param pWidth The total width of the parent container.
   * @param pHeight The total height of the parent container.
   * @param vWidth The total width of the scrolled container.
   * @param vHeight The total height of the scrolled container.
   * @returns {ScrollBar} This instance.
   */
  public reshape(pWidth: number, pHeight: number, vWidth: number, vHeight: number): ScrollBar {
    // clear the shapes and draw them completely from scratch
    this.bar.clear();
    this.thumb.clear();

    // FIXME: externalize these colors
    this.bar.beginFill(0xEFEFEF);
    this.thumb.beginFill(0x777777);

    if (this.vertical) {
      this.bar.drawRect(0, 0, SCROLL_SIZE, pHeight);
      this.bar.x = pWidth - SCROLL_SIZE;
      this.bar.y = 0;

      // compute the height of the thumb to be some percentage of the total height of scrollable area
      let th = vHeight <= pHeight ? pHeight : (pHeight / vHeight) * pHeight;
      this.thumb.drawRect(0, 0, SCROLL_SIZE, th);
      this.thumb.hitArea = new PIXI.Rectangle(0, 0, SCROLL_SIZE, th);

      this.max = pHeight;
    }

    else {
      this.bar.drawRect(0, 0, pWidth, SCROLL_SIZE);
      this.bar.x = 0;
      this.bar.y = pHeight - SCROLL_SIZE;

      // compute the width of the thumb to be some percentage of the total width of scrollable area
      let tw = vWidth <= pWidth ? pWidth : (pWidth / vWidth) * pWidth;
      this.thumb.drawRect(0, 0, tw, SCROLL_SIZE);
      this.thumb.hitArea = new PIXI.Rectangle(0, 0, tw, SCROLL_SIZE);

      this.max = pWidth;
    }

    this.bar.endFill();
    return this;
  }

  /**
   * Handler invoked when a mouse drag starts.
   *
   * @param e The mouse event.
   */
  private onDragStart(e: any): void {
    this.thumb.alpha = 0.5;
    this.lastMouseEvent = e.data;
    this.grab = this.lastMouseEvent.getLocalPosition(this.parent);
  }

  /**
   * Handler invoked when a mouse drag stops.
   *
   * @param e The mouse event.
   */
  private onDragEnd(e: any): void {
    this.thumb.alpha = 1;
    this.lastMouseEvent = null;
    this.grab = null;
  }

  /**
   * Handler invoked when a mouse was dragged.
   */
  private onDragMove(): void {
    if (this.lastMouseEvent) {
      // find the position of the mouse relative to the scrollbar's parent
      var pos = this.lastMouseEvent.getLocalPosition(this.parent);

      if (this.vertical) {
        // compute the difference between our last grab position and hte cursor now along the y axis
        let delta = pos.y - this.grab.y;

        // clamp the scrollbar to the top of the parent container
        if (delta < 0 && this.thumb.y + delta < 0) {
          delta = -this.thumb.y;
        }

        // clamp the scrollbar to the bottom of the parent container
        else if (delta > 0 && this.thumb.y + this.thumb.height + delta > this.max) {
          delta = this.max - this.thumb.y - this.thumb.height;
        }

        this.updateY(pos, delta);
      }

      else {
        let delta = pos.x - this.grab.x;

        // clamp the scrollbar to the left of the parent container
        if (delta < 0 && this.thumb.x + delta < 0) {
          delta = -this.thumb.x;
        }

        // clamp the scrollbar to the right of the parent container
        if (delta > 0 && this.thumb.x + this.thumb.width + delta > this.max) {
          delta = this.max - this.thumb.x - this.thumb.width;
        }

        this.updateX(pos, delta);
      }
    }
  }

  /**
   * Updates the position of the thumb by some vertical delta.
   *
   * @param pos The new mouse position.
   * @param delta The delta to move the thumb by.
   */
  private updateY(pos: PIXI.Point, delta: number): void {
    if (delta !== 0) {
      this.thumb.y += delta;
      this.grab = pos;

      this.scrollAction.next(this.thumb.y / this.max);
    }
  }

  /**
   * Updates the position of the thumb by some horizontal delta.
   *
   * @param pos The new position of the mouse.
   * @param delta The delta to move the thumb by.
   */
  private updateX(pos: PIXI.Point, delta: number): void {
    if (delta !== 0) {
      this.thumb.x += delta;
      this.grab = pos;

      this.scrollAction.next(this.thumb.x / this.max);
    }
  }
}
