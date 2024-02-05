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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { InventoryService } from '../../shared/service/inventory.service';

@Component({
  selector: 'app-view-stock-adjustment-draft-details',
  templateUrl: './view-stock-adjustment-draft-details.component.html',
  styleUrls: ['./view-stock-adjustment-draft-details.component.css'],
})
export class ViewStockAdjustmentDraftDetailsComponent
  implements OnInit, DoCheck
{
  filterTerm!: string;

  stock: any;
  adjustmentList: any = [];
  filteredAdjustmentList: any = [];
  currentLanguageSet: any;
  languageComponent!: SetLanguageComponent;

  constructor(
    private http_service: LanguageService,
    @Inject(MAT_DIALOG_DATA) public input: any,
    public dialogRef: MatDialogRef<ViewStockAdjustmentDraftDetailsComponent>,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit() {
    this.fetchLanguageResponse();
    if (this.input && this.input.adjustmentID) {
      this.getStockAdjustmentDetails(this.input.adjustmentID);
    }
  }

  getStockAdjustmentDetails(adjustmentID: any) {
    const temp = parseInt(adjustmentID);
    this.inventoryService
      .getStockAdjustmentDraftDetails(temp)
      .subscribe((response) => {
        this.stock = response;
        this.adjustmentList = response.stockAdjustmentItemDraftEdit.slice();
        this.filteredAdjustmentList =
          response.stockAdjustmentItemDraftEdit.slice();
      });
  }

  filterDetails(filterTerm: any) {
    if (!filterTerm) this.filteredAdjustmentList = this.adjustmentList.slice();
    else {
      this.filteredAdjustmentList = [];
      this.adjustmentList.forEach((item: any) => {
        for (const key in item) {
          if (
            key == 'itemName' ||
            key == 'batchID' ||
            key == 'reason' ||
            key == 'quantityInHand' ||
            key == 'adjustedQuantity' ||
            key == 'isAdded'
          ) {
            const value: string = '' + item[key];
            if (key == 'isAdded') {
              if (
                'receipt'.indexOf(filterTerm.toLowerCase()) >= 0 &&
                item[key]
              ) {
                this.filteredAdjustmentList.push(item);
                break;
              } else if (
                'issue'.indexOf(filterTerm.toLowerCase()) >= 0 &&
                !item[key]
              ) {
                this.filteredAdjustmentList.push(item);
                break;
              }
            }
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this.filteredAdjustmentList.push(item);
              break;
            }
          }
        }
      });
    }
  }

  //AN40085822 29/9/2021 Integrating Multilingual Functionality --Start--
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  //--End--
}
