/*
 * AMRIT – Accessible Medical Records via Integrated Technology
 * Integrated EHR (Electronic Health Records) Solution
 *
 * Copyright (C) "Piramal Swasthya Management and Research Institute"
 *
 * This file is part of AMRIT.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { Component, OnInit, Inject, DoCheck } from '@angular/core';
import { ItemSearchService } from '../../services/item-search.service';

import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SetLanguageComponent } from '../set-language.component';
import { LanguageService } from '../../services/language.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.css'],
})
export class ItemSearchComponent implements OnInit, DoCheck {
  searchTerms!: string;
  items$!: Observable<any>;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  displayedColumns: string[] = [
    'itemCode',
    'itemName',
    'itemCategory',
    'itemForm',
    'pharmacologicalCategory',
    'strength',
    'action',
  ];
  // dataSource!: MatTableDataSource<any>;
  dataSource = new MatTableDataSource([{}]);
  constructor(
    @Inject(MAT_DIALOG_DATA) public input: any,
    public http_service: LanguageService,
    private itemSearchService: ItemSearchService,
  ) {}

  ngOnInit() {
    this.search(this.input.searchTerm);
    this.fetchLanguageResponse();
    // this.items$.subscribe(data => {
    //   this.dataSource = new MatTableDataSource(data);
    // })
  }

  search(term: string): void {
    this.items$ = this.itemSearchService.searchDrugItem(term);
    this.items$.subscribe((data: any) => {
      if (data) {
        this.dataSource = new MatTableDataSource(data);
      }
    });
  }

  // AV40085804 29/09/2021 Integrating Multilingual Functionality -----Start-----
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------
}
