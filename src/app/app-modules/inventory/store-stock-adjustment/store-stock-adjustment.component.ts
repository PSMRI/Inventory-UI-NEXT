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
import { Component, DoCheck, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SetLanguageComponent } from '../../core/components/set-language.component';
import { LanguageService } from '../../core/services/language.service';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { InventoryService } from '../shared/service/inventory.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-store-stock-adjustment',
  templateUrl: './store-stock-adjustment.component.html',
  styleUrls: ['./store-stock-adjustment.component.css'],
})
export class StoreStockAdjustmentComponent implements OnInit, DoCheck {
  storeStockAdjustmentForm!: FormGroup;
  adjustmentTypeList = ['Issue', 'Receipt'];
  draftID: any;

  editMode = false;
  currentLanguageSet: any;
  languageComponent!: SetLanguageComponent;
  isMainStore = false;
  lastUpdatedStockDate: any;
  // dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  // dataSource!: MatTableDataSource<AbstractControl>;

  displayedColumns: string[] = [
    'itemName',
    'batchID',
    'quantityOnHand',
    'adjustmentType',
    'adjustmentQuantity',
    'qOHAfterAdjustment',
    'reason',
    'action',
  ];
  stockItemName: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private http_service: LanguageService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private inventoryService: InventoryService,
  ) {}
  dataSource = new MatTableDataSource<any>();

  ngOnInit() {
    // this.storeStockAdjustmentForm = this.createStoreStockAdjustmentForm();
    this.storeStockAdjustmentForm = this.fb.group({
      refNo: [''],
      adjustmentDate: { value: new Date(), disabled: true },
      stockAdjustmentDraftID: [''],
      draftDesc: [''],
      stockAdjustmentList: this.fb.array([]),
      // stockAdjustmentList: this.fb.array([this.initStockAdjustmentList()]),
    });
    this.initStockAdjustmentList();
    this.draftID = this.route.snapshot.paramMap.get('draftID');
    this.fetchLanguageResponse();

    if (this.draftID) {
      this.editMode = true;
      this.getStockAdjustmentDraftDetails(this.draftID);
    } else {
      this.editMode = false;
    }

    const isMainStore: any = localStorage.getItem('facilityDetail');
    this.isMainStore = JSON.parse(isMainStore).isMainFacility;
    this.showLastUpdatedStockLog();
    this.loadStockAdjData();
  }

  loadStockAdjData() {
    const dataFromFun: any = this.stroreStockTableData();
    console.log('dataFromFun####', dataFromFun);
    this.dataSource.data = dataFromFun;
  }

  createStoreStockAdjustmentForm() {
    return this.fb.group({
      refNo: null,
      adjustmentDate: { value: new Date(), disabled: true },
      stockAdjustmentDraftID: null,
      draftDesc: null,
    });
  }

  initStockAdjustmentList() {
    const frmArrStoreAdj = this.storeStockAdjustmentForm.get(
      'stockAdjustmentList',
    ) as FormArray;
    frmArrStoreAdj.push(
      this.fb.group({
        itemStockEntryID: [''],
        itemID: [''],
        itemName: [''],
        batchID: [''],
        quantityInHand: [''],
        adjustmentType: [''],
        adjustedQuantity: [''],
        qohAfterAdjustment: [''],
        reason: [''],
        deleted: [''],
        stockAdjustmentDraftID: [''],
        sADraftItemMapID: [''],
      }),
    );
  }
  initPhysicalStockForm() {
    return this.fb.group({
      itemStockEntryID: [''],
      itemID: [''],
      itemName: [''],
      batchID: [''],
      quantityInHand: [''],
      adjustmentType: [''],
      adjustedQuantity: [''],
      qohAfterAdjustment: [''],
      reason: [''],
      deleted: [''],
      stockAdjustmentDraftID: [''],
      sADraftItemMapID: [''],
    });
  }

  stroreStockTableData(): any {
    return (
      this.storeStockAdjustmentForm.get('stockAdjustmentList') as FormArray
    ).controls;
  }

  get stockAdjustmentList() {
    return this.storeStockAdjustmentForm.get(
      'stockAdjustmentList',
    ) as FormArray;
  }

  refresh(event: any, stock: any) {
    console.log('event##', event);
    stock.controls['itemName'].setValue(event.target.value);
    console.log('stock', stock);
    console.log('STOCK##', stock);
    this.dataSource.data = this.stroreStockTableData();
  }
  addToStockAdjustmentList() {
    this.stockAdjustmentList.push(this.initPhysicalStockForm());
    this.loadStockAdjData();
  }

  removeFromStockAdjustmentList(index: any, stockForm?: FormGroup) {
    const stockArrForm = this.storeStockAdjustmentForm.get(
      'stockAdjustmentList',
    ) as FormArray;

    if (stockArrForm.length > 1) {
      stockArrForm.removeAt(index);
      // stockForm.clear();
      this.loadStockAdjData();
    } else {
      if (stockForm) {
        stockForm.reset();
        stockForm.controls['itemName'].enable();
      }
    }
  }

  submitStockAdjustmentDraft(storeStockAdjustmentForm: FormGroup) {
    const storeStockAdjustment = JSON.parse(
      JSON.stringify(storeStockAdjustmentForm.value),
    );

    const otherDetails = {
      createdBy: localStorage.getItem('username'),
      modifiedBy: localStorage.getItem('username'),
      providerServiceMapID: localStorage.getItem('providerServiceID'),
      facilityID: localStorage.getItem('facilityID'),
      vanID: localStorage.getItem('vanID'),
      parkingPlaceID: localStorage.getItem('parkingPlaceID'),
    };

    const stockAdjustmentItemDraft =
      storeStockAdjustment.stockAdjustmentList.map((item: any) => {
        item.isAdded = item.adjustmentType == 'Receipt' ? true : false;
        item.adjustedQuantity = item.adjustedQuantity
          ? +item.adjustedQuantity
          : 0;
        item.adjustmentType = undefined;
        item = Object.assign({}, item, otherDetails);
        return item;
      });

    const temp = Object.assign({}, storeStockAdjustment, otherDetails, {
      stockAdjustmentItemDraft: stockAdjustmentItemDraft,
      stockAdjustmentList: undefined,
    });

    this.confirmationService
      .provideDraftDescription(
        this.currentLanguageSet.inventory.draftDescription,
        temp.draftDesc,
      )
      .subscribe((draftDesc) => {
        temp.draftDesc = draftDesc;

        this.inventoryService
          .saveStockAdjustmentDraft(temp)
          .subscribe((response) => {
            if (temp.stockAdjustmentDraftID) {
              this.confirmationService.alert(
                this.currentLanguageSet.inventory.updatedSuccessfully,
                'success',
              );
              // this.getStockAdjustmentDraftDetails(this.draftID);
              this.storeStockAdjustmentForm.reset({
                adjustmentDate: new Date(),
              });
              this.location.back();
            } else {
              this.confirmationService.alert(
                this.currentLanguageSet.inventory.savedsuccessfully,
                'success',
              );
              this.storeStockAdjustmentForm.reset();
              this.storeStockAdjustmentForm.reset({
                adjustmentDate: new Date(),
              });
              this.resetStockAdjustmentFormArray();
            }
          });
      });
  }

  submitStockAdjustmentFinal(storeStockAdjustmentForm: FormGroup) {
    const storeStockAdjustment = JSON.parse(
      JSON.stringify(storeStockAdjustmentForm.value),
    );

    const otherDetails = {
      createdBy: localStorage.getItem('username'),
      providerServiceMapID: localStorage.getItem('providerServiceID'),
      facilityID: localStorage.getItem('facilityID'),
      vanID: localStorage.getItem('vanID'),
      parkingPlaceID: localStorage.getItem('parkingPlaceID'),
    };

    const stockAdjustmentItemDraft =
      storeStockAdjustment.stockAdjustmentList.map((item: any) => {
        item.isAdded = item.adjustmentType == 'Receipt' ? true : false;
        item.adjustedQuantity = item.adjustedQuantity
          ? +item.adjustedQuantity
          : 0;
        item.adjustmentType = undefined;
        item = Object.assign({}, item, otherDetails);
        return item;
      });

    const temp = Object.assign({}, storeStockAdjustment, otherDetails, {
      stockAdjustmentItem: stockAdjustmentItemDraft,
      stockAdjustmentList: undefined,
    });

    this.inventoryService.saveStockAdjustment(temp).subscribe((response) => {
      if (temp.stockAdjustmentDraftID) {
        this.confirmationService.alert(
          this.currentLanguageSet.inventory.savedsuccessfully,
          'success',
        );
        // this.getStockAdjustmentDraftDetails(this.draftID);
        this.storeStockAdjustmentForm.reset({ adjustmentDate: new Date() });
        this.location.back();
      } else {
        this.confirmationService.alert(
          this.currentLanguageSet.inventory.savedsuccessfully,
          'success',
        );
        this.storeStockAdjustmentForm.reset();
        this.storeStockAdjustmentForm.reset({ adjustmentDate: new Date() });
        this.resetStockAdjustmentFormArray();
      }
    });
  }

  getStockAdjustmentDraftDetails(draftID: any) {
    const temp = parseInt(draftID);
    this.inventoryService
      .getStockAdjustmentDraftDetails(temp)
      .subscribe((response) => {
        const stockAdjustmentList = response.stockAdjustmentItemDraftEdit;

        // Clear the existing data in the MatTableDataSource
        this.dataSource.data = [];

        for (let i = 0; i < stockAdjustmentList.length; i++) {
          stockAdjustmentList[i].adjustmentType = stockAdjustmentList[i].isAdded
            ? 'Receipt'
            : 'Issue';
          stockAdjustmentList[i].stockAdjustmentDraftID =
            response.stockAdjustmentDraftID;
          this.dataSource.data.push(stockAdjustmentList[i]);
        }

        // Assign the modified data to MatTableDataSource
        this.dataSource.data = this.dataSource.data.slice();

        this.storeStockAdjustmentForm.patchValue({
          adjustmentDate: new Date(response.createdDate),
          refNo: response.refNo,
          stockAdjustmentDraftID: response.stockAdjustmentDraftID,
          draftDesc: response.draftDesc,
        });
      });
  }

  calculateQOHAfterAdjustment(stockForm: FormGroup) {
    const qoh = parseInt(stockForm.value.quantityInHand) || 0;
    const adjustedQuantity = parseInt(stockForm.value.adjustedQuantity) || 0;
    const adjustmentType = stockForm.value.adjustmentType;

    if (adjustmentType == 'Receipt') {
      if (qoh >= 0 && adjustedQuantity >= 0)
        stockForm.patchValue({ qohAfterAdjustment: qoh + adjustedQuantity });
    } else if (adjustmentType == 'Issue') {
      if (qoh > 0 && adjustedQuantity >= 0 && adjustedQuantity <= qoh)
        stockForm.patchValue({ qohAfterAdjustment: qoh - adjustedQuantity });
    }
  }

  resetStockAdjustmentFormArray() {
    const stockAdjustmentFormArray = this.storeStockAdjustmentForm.get(
      'stockAdjustmentList',
    ) as FormArray;
    stockAdjustmentFormArray.controls.length = 0;
    this.addToStockAdjustmentList();
  }

  resetStoreStockAdjustmentForm() {
    this.storeStockAdjustmentForm.reset({ adjustmentDate: new Date() });
    this.resetStockAdjustmentFormArray();
  }

  goBack() {
    this.location.back();
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

  addEAushadhiStock() {
    const reqObj = {
      facilityID: localStorage.getItem('facilityID'),
    };
    this.inventoryService.addEAushadhiItemsToAmrit(reqObj).subscribe(
      (response) => {
        if (
          response != null &&
          response !== undefined &&
          response.statusCode === 200
        ) {
          this.confirmationService.alert(response.data.response, 'success');
          this.showLastUpdatedStockLog();
        } else {
          this.confirmationService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.confirmationService.alert(err, 'error');
      },
    );
  }
  showLastUpdatedStockLog() {
    const reqObj = {
      facilityID: localStorage.getItem('facilityID'),
    };
    this.inventoryService.showLastUpdatedStockLogs(reqObj).subscribe(
      (logResponse) => {
        console.log('response stock', logResponse);
        if (
          logResponse != null &&
          logResponse !== undefined &&
          logResponse.statusCode === 200
        ) {
          if (logResponse.data.lastSuccessDate)
            this.lastUpdatedStockDate = new Date(
              logResponse.data.lastSuccessDate,
            );
          else this.lastUpdatedStockDate = null;
        } else {
          this.confirmationService.alert(logResponse.errorMessage, 'error');
        }
      },
      (err) => {
        this.confirmationService.alert(err, 'error');
      },
    );
  }
}
