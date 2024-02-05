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
  dataSource!: MatTableDataSource<AbstractControl>;

  displayedColumns: string[] = [
    'itemName',
    'batchID',
    'quantityOnHand',
    'adjustmentType',
    'adjustmentQuantity',
    'qOHAfterAdjustment',
    'reason',
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private http_service: LanguageService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit() {
    this.storeStockAdjustmentForm = this.createStoreStockAdjustmentForm();
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
  }

  createStoreStockAdjustmentForm() {
    return this.fb.group({
      refNo: null,
      adjustmentDate: { value: new Date(), disabled: true },
      stockAdjustmentDraftID: null,
      draftDesc: null,
      stockAdjustmentList: this.fb.array([this.initStockAdjustmentList()]),
    });
  }

  initStockAdjustmentList() {
    return this.fb.group({
      itemStockEntryID: null,
      itemID: null,
      itemName: null,
      batchID: null,
      quantityInHand: null,
      adjustmentType: null,
      adjustedQuantity: null,
      qohAfterAdjustment: null,
      reason: null,
      deleted: false,
      stockAdjustmentDraftID: null,
      sADraftItemMapID: null,
    });
  }

  stroreStockTableData(): AbstractControl[] {
    return (
      this.storeStockAdjustmentForm.get('stockAdjustmentList') as FormArray
    ).controls;
  }
  // addToStockAdjustmentList() {
  //   const stockAdjustmentFormArray = this.storeStockAdjustmentForm.get('stockAdjustmentList') as FormArray;
  //   stockAdjustmentFormArray.push(this.initStockAdjustmentList());
  //   this.dataSource.data = stockAdjustmentFormArray.value;
  // }

  addToStockAdjustmentList() {
    const stockAdjustmentFormArray = this.storeStockAdjustmentForm.controls[
      'stockAdjustmentList'
    ] as FormArray;
    stockAdjustmentFormArray.push(this.initStockAdjustmentList());
  }

  removeFromStockAdjustmentList(index: any, stockForm?: FormGroup) {
    const stockAdjustmentFormArray = this.storeStockAdjustmentForm.controls[
      'stockAdjustmentList'
    ] as FormArray;

    if (stockAdjustmentFormArray.length > 1) {
      stockAdjustmentFormArray.removeAt(index);
    } else {
      if (stockForm) {
        stockForm.reset();
        stockForm.controls['itemName'].enable();
      }
    }
  }
  // removeFromStockAdjustmentList(index: any) {
  //   const stockAdjustmentFormArray = this.storeStockAdjustmentForm.get('stockAdjustmentList') as FormArray;
  //   stockAdjustmentFormArray.removeAt(index);
  //   this.dataSource.data = stockAdjustmentFormArray.value;
  // }

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

  // getStockAdjustmentDraftDetails(draftID: any) {
  //   const temp = parseInt(draftID);
  //   this.inventoryService
  //     .getStockAdjustmentDraftDetails(temp)
  //     .subscribe((response) => {
  //       const stockAdjusmentList = response.stockAdjustmentItemDraftEdit;
  //       const stockAdjustmentFormArray = this.storeStockAdjustmentForm.controls[
  //         'stockAdjustmentList'
  //       ] as FormArray;

  //       for (let i = 0; i < stockAdjusmentList.length; i++) {
  //         stockAdjusmentList[i].adjustmentType = stockAdjusmentList[i].isAdded
  //           ? 'Receipt'
  //           : 'Issue';
  //         stockAdjusmentList[i].stockAdjustmentDraftID =
  //           response.stockAdjustmentDraftID;
  //         stockAdjustmentFormArray.at(i).patchValue(stockAdjusmentList[i]);
  //         (<FormGroup>stockAdjustmentFormArray.at(i)).controls[
  //           'itemName'
  //         ].disable();
  //         this.calculateQOHAfterAdjustment(
  //           stockAdjustmentFormArray.at(i) as FormGroup,
  //         );
  //         if (stockAdjustmentFormArray.length < stockAdjusmentList.length)
  //           this.addToStockAdjustmentList();
  //       }

  //       this.storeStockAdjustmentForm.patchValue({
  //         adjustmentDate: new Date(response.createdDate),
  //         refNo: response.refNo,
  //         stockAdjustmentDraftID: response.stockAdjustmentDraftID,
  //         draftDesc: response.draftDesc,
  //       });
  //     });
  // }

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

  // resetStockAdjustmentFormArray() {
  //   const stockAdjustmentFormArray = this.storeStockAdjustmentForm.controls[
  //     'stockAdjustmentList'
  //   ] as FormArray;
  //   stockAdjustmentFormArray.controls.length = 0;
  //   this.addToStockAdjustmentList();
  // }
  resetStockAdjustmentFormArray() {
    const stockAdjustmentFormArray = this.storeStockAdjustmentForm.get(
      'stockAdjustmentList',
    ) as FormArray;
    stockAdjustmentFormArray.controls.length = 0;
    this.addToStockAdjustmentList();
  }

  // resetStoreStockAdjustmentForm() {
  //   this.resetStockAdjustmentFormArray();
  //   this.storeStockAdjustmentForm.reset({ adjustmentDate: new Date() });
  // }

  resetStoreStockAdjustmentForm() {
    this.resetStockAdjustmentFormArray();
    this.storeStockAdjustmentForm.reset({ adjustmentDate: new Date() });
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