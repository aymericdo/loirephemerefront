import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, fromEvent, takeUntil } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';
import { selectDemoResto, selectUser } from 'src/app/auth/store/auth.selectors';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgZorroModule,
    RouterModule,
  ],
})
export class AboutComponent implements OnInit, OnDestroy {
  @ViewChildren('sectionImg') sectionImgs!: QueryList<ElementRef<HTMLDivElement>>;

  hasScrolled = false;
  demoResto$: Observable<Restaurant | null>;
  user$: Observable<User | null>;

  waveSeparationStyle: { transform: string } = { transform: `translateY(0)` };

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private store: Store,
  ) {
    this.demoResto$ = this.store.select(selectDemoResto);
    this.user$ = this.store.select(selectUser);

    fromEvent(window, 'scroll')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((_e: Event) => {
        this.movingElements();
      });
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((params) => {
      if (!params['tab']) {
        this.router.navigate([], { relativeTo: this.route, queryParams: { tab: 'context' } });
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onChange(status: boolean): void {
    this.hasScrolled = status;
    this.changeDetectorRef.detectChanges();
  }

  getWaveSeparationStyle(): { transform: string } {
    return this.waveSeparationStyle;
  }

  scroll(el: HTMLElement): void {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private movingElements(): void {
    this.setWaveSeparationStyle();
    this.sectionImgs.forEach((sectionImg) => {
      const bodyRect = sectionImg.nativeElement.getBoundingClientRect();
      const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
      if ((bodyRect.top - viewHeight) < 0) {
        sectionImg.nativeElement.classList.add('-visible');
      }
    });
    this.changeDetectorRef.detectChanges();
  }

  private setWaveSeparationStyle(): void {
    const triggerPosition = 200;
    const move = (window.scrollY > triggerPosition) ?
      0 - ((window.scrollY - triggerPosition) / 2) :
      0;
    this.waveSeparationStyle = { transform: `translateY(${move}px)` };
  }
}
