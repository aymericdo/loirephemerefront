import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export const TABLES_POSSIBILITIES: string[] = [
  'À emporter',
  'Bulbizarre',
  'Salamèche',
  'Carapuce',
  'Coconfort',
  'Roucool',
  'Nidoqueen',
  // 'Mélofée',
  // 'Aéromite',
  // 'Arcanin',
  // 'Onix',
  // 'Amonita',
  // 'Kabuto',
  // 'Draco',
];

@Component({
  selector: 'app-table-modal',
  templateUrl: './table-modal.component.html',
  styleUrls: ['./table-modal.component.scss'],
})
export class TableModalComponent implements OnInit {
  tables: string[] = TABLES_POSSIBILITIES;
  currentTable = '';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  handleOkTableModal(): void {
    this.router.navigate(['/table', this.currentTable]);
  }

  handleTakeAway(): void {
    this.router.navigate(['/table', 'À emporter']);
  }

  handleCancelTableModal(): void {
    this.router.navigate(['/']);
  }
}
