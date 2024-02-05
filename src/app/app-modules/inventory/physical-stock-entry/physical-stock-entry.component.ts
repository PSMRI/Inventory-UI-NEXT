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
import { Component, OnInit, OnChanges, DoCheck } from '@angular/core';
import { InventoryService } from '../shared/service/inventory.service';
import { Observable } from 'rxjs';
import {
  NgForm,
  FormBuilder,
  FormArray,
  Validators,
  FormGroup,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { SetLanguageComponent } from '../../core/components/set-language.component';
import { LanguageService } from '../../core/services/language.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-physical-stock-entry',
  templateUrl: './physical-stock-entry.component.html',
  styleUrls: ['./physical-stock-entry.component.css'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class PhysicalStockEntryComponent implements OnInit, OnChanges, DoCheck {
  physicalStockEntryForm!: FormGroup;
  otherDetails: any;
  physicalStockList: any = [];
  today!: Date;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  displayedColumns: string[] = [
    'index',
    'itemName',
    'quantity',
    'totalCostPrice',
    'batchNo',
    'expiryDate',
    'actions',
  ];
  stockEntryDate = new FormControl(new Date());
  dataSource!: MatTableDataSource<AbstractControl>;
  constructor(
    private inventoryService: InventoryService,
    private http_service: LanguageService,
    private dialogService: ConfirmationService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.otherDetails = {
      createdBy: localStorage.getItem('username'),
      providerServiceMapID: localStorage.getItem('providerServiceID'),
      userId: localStorage.getItem('userID'),
      facilityID: localStorage.getItem('facilityID'),
      vanID: localStorage.getItem('vanID'),
      parkingPlaceID: localStorage.getItem('parkingPlaceID'),
    };

    this.today = new Date();
    this.fetchLanguageResponse();
    this.physicalStockEntryForm = this.createPhysicalStockEntryForm();
  }

  ngOnChanges() {
    console.log('form', this.physicalStockEntryForm);
  }

  createPhysicalStockEntryForm() {
    return this.fb.group({
      referenceNumber: null,
      stockEntryDate: null,
      physicalStock: new FormArray([this.initPhysicalStock()]),
    });
  }

  get isMedical() {
    return this.physicalStockEntryForm.controls['isMedical'].value;
  }

  initPhysicalStock() {
    return this.fb.group({
      batchNo: [null, Validators.required],
      expiryDate: null,
      itemID: [null, Validators.required],
      itemName: [null, Validators.required],
      quantity: [null, Validators.required],
      totalCostPrice: [null, Validators.required],
      isMedical: null,
    });
  }

  physicalStockTableData(): AbstractControl[] {
    return (this.physicalStockEntryForm.get('physicalStock') as FormArray)
      .controls;
  }

  // this.dataSource = new MatTableDataSource<AbstractControl>(this.physicalStockTableData());

  addStock() {
    const stockForm = this.physicalStockEntryForm.controls[
      'physicalStock'
    ] as FormArray;
    stockForm.push(this.initPhysicalStock());
  }

  removeStock(index: any, stock?: FormGroup) {
    const stockForm = this.physicalStockEntryForm.controls[
      'physicalStock'
    ] as FormArray;
    if (stockForm.length > 1) {
      stockForm.removeAt(index);
    } else {
      stockForm.reset();
      stockForm.enable();
    }
  }

  savePhysicalStock() {
    const physicalStockEntry = JSON.parse(
      JSON.stringify(this.physicalStockEntryForm.value),
    );

    physicalStockEntry.physicalStock.map((item: any) => {
      item.createdBy = this.otherDetails.createdBy;
      item.facilityID = this.otherDetails.facilityID;
    });

    const temp = Object.assign({}, physicalStockEntry, this.otherDetails, {
      refNo: physicalStockEntry.referenceNumber,
      status: 'Active',
      itemStockEntry: physicalStockEntry.physicalStock,
      physicalStock: undefined,
      referenceNumber: undefined,
    });

    // console.log("Physical Entry Stock ", JSON.stringify(temp, null, 4));

    this.inventoryService.savePhysicalStock(temp).subscribe(
      (response) => {
        if (
          response.statusCode == 200 &&
          response.data &&
          response.data.phyEntryID
        ) {
          this.dialogService.alert(
            this.currentLanguageSet.inventory.savedsuccessfully,
            'success',
          );
          this.reset();
        } else this.dialogService.alert(response.status, 'error');
      },
      (err) => {
        this.dialogService.alert(err, 'error');
      },
    );
  }

  reset() {
    // this.removeAllPhysicalStock(this.physicalStockEntryForm.controls['physicalStock'] as FormArray);
    // this.physicalStockEntryForm.reset();
    this.physicalStockEntryForm = this.createPhysicalStockEntryForm();

    this.today = new Date();
  }

  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }

  removeAllPhysicalStock(physicalStockArray: FormArray) {
    // let len = physicalStockArray.length;

    while (physicalStockArray.length > 1) {
      physicalStockArray.removeAt(0);
    }
    // physicalStockArray.enable();
  }

  checkForDuplicateBatch(stockForm: FormGroup, index: any) {
    // const index = (this.physicalStockEntryForm.get('physicalStock') as FormArray).controls.indexOf(stockForm)
    const stockList =
      this.physicalStockEntryForm.controls['physicalStock'].value;
    const itemID = stockForm.value.itemID;
    const batchNo = stockForm.value.batchNo;

    const temp = stockList.filter((stock: any, i: any) => {
      if (i != index)
        return (
          itemID &&
          stock.itemID == itemID &&
          batchNo &&
          stock.batchNo == batchNo
        );
      else return false;
    });

    if (temp.length > 0) {
      this.dialogService.alert(
        this.currentLanguageSet.inventory.batchalreadypresent,
        'warn',
      );
      stockForm.controls['batchNo'].reset();
    }
  }

  getPhysicalStockControls() {
    const physicalStockArray = this.physicalStockEntryForm.get(
      'physicalStock',
    ) as FormArray;
    return physicalStockArray.controls;
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
