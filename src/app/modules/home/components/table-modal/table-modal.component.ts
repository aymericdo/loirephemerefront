import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table-modal',
  templateUrl: './table-modal.component.html',
})
export class TableModalComponent implements OnInit {
  @Input() isOpenTableModal: boolean = false;

  tables: string[] = [
    'Bulbizarre',
    'Salamèche',
    'Carapuce',
    'Coconfort',
    'Roucool',
    'Nidoqueen',
    'Mélofée',
    'Aéromite',
    'Arcanin',
    'Onix',
    'Amonita',
    'Kabuto',
    'Draco',
  ];
  currentTable = '';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  handleOkTableModal(): void {
    this.router.navigate(['/'], { queryParams: { table: this.currentTable } });
    this.isOpenTableModal = false;
  }
}
