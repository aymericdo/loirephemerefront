import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  isCollapsed = false;
  restaurantCode: string | null = null;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(e => (e instanceof ActivationEnd) && (Object.keys(e.snapshot.params).length > 0)),
        map(e => e instanceof ActivationEnd ? e.snapshot.params : {})
      )
      .subscribe(params => {
        this.restaurantCode = params.code;
      });
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  isHome(): boolean {
    return this.router.url === '/'
  }
}
