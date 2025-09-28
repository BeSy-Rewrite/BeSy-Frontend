import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scaredBtn', { static: true, read: ElementRef })
  scaredBtn?: ElementRef<HTMLAnchorElement>;
  @ViewChild('area', { static: true, read: ElementRef })
  area?: ElementRef<HTMLDivElement>;

  private removeListeners: Array<() => void> = [];

  ngAfterViewInit() {
    // Defer until after first paint to ensure elements are laid out
    requestAnimationFrame(() => this.setupScaredButton());
  }

  ngOnDestroy() {
    // Cleanup any listeners we added
    for (const off of this.removeListeners) off();
    this.removeListeners = [];
  }

  private setupScaredButton() {
    const btn = this.scaredBtn?.nativeElement;
    const area = this.area?.nativeElement;

    if (!btn || !area) {
      // Try again on next frame if view children not yet resolved
      requestAnimationFrame(() => this.setupScaredButton());
      return;
    }

    // Center the button initially within the area using left/top coordinates
    const a0 = area.getBoundingClientRect();
    const b0 = btn.getBoundingClientRect();
    const initLeft = Math.max(0, (a0.width - b0.width) / 2);
    const initTop = Math.max(0, (a0.height - b0.height) / 2);
    btn.style.left = initLeft + 'px';
    btn.style.top = initTop + 'px';

    const SAFE_DIST = 140;

    function clamp(n: number, min: number, max: number) {
      return Math.max(min, Math.min(n, max));
    }

    function centerOf(el: HTMLElement, relTo: DOMRect) {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - relTo.left + r.width / 2,
        y: r.top - relTo.top + r.height / 2,
        w: r.width,
        h: r.height,
      };
    }

    let raf: number | null = null;
    let lastEvt: MouseEvent | TouchEvent | null = null;

    const tick = () => {
      raf = null;
      if (!lastEvt) return;

      const a = area.getBoundingClientRect();
      const isTouch = (lastEvt as TouchEvent).touches;
      const mx = isTouch
        ? (lastEvt as TouchEvent).touches[0].clientX - a.left
        : (lastEvt as MouseEvent).clientX - a.left;
      const my = isTouch
        ? (lastEvt as TouchEvent).touches[0].clientY - a.top
        : (lastEvt as MouseEvent).clientY - a.top;

      const b = centerOf(btn, a);
      const dx = b.x - mx;
      const dy = b.y - my;
      const dist = Math.hypot(dx, dy);

      if (dist >= SAFE_DIST) return;

      const angle = Math.atan2(dy, dx);
      const move = SAFE_DIST - dist;

      const newCenterX = b.x + Math.cos(angle) * move;
      const newCenterY = b.y + Math.sin(angle) * move;

      const newLeft = newCenterX - b.w / 2;
      const newTop = newCenterY - b.h / 2;

      const maxL = a.width - b.w;
      const maxT = a.height - b.h;
      const clampedLeft = clamp(newLeft, 0, maxL);
      const clampedTop = clamp(newTop, 0, maxT);

      btn.style.left = clampedLeft + 'px';
      btn.style.top = clampedTop + 'px';

      btn.classList.toggle('wiggle', dist < SAFE_DIST * 0.8);
    };

    const onPointerMove = (evt: MouseEvent | TouchEvent) => {
      lastEvt = evt;
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    area.addEventListener('mousemove', onPointerMove, { passive: true });
    area.addEventListener('touchmove', onPointerMove, { passive: true });

    this.removeListeners.push(() =>
      area.removeEventListener('mousemove', onPointerMove)
    );
    this.removeListeners.push(() =>
      area.removeEventListener('touchmove', onPointerMove)
    );
  }
}
