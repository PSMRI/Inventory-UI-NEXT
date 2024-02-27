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
  FormArray,
  FormControl,
  FormGroup,
  AbstractControl,
} from '@angular/forms';
import { ConfirmationService } from './../../services/confirmation.service';
import { LanguageService } from '../../services/language.service';
import { SetLanguageComponent } from '../set-language.component';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-rx-batch-view',
  templateUrl: './rx-batch-view.component.html',
  styleUrls: ['./rx-batch-view.component.css'],
})
export class RxBatchViewComponent implements OnInit, DoCheck {
  public items: any;
  public prescribed: any;
  public editSelection!: number;
  dispensed: any;
  itemsForm!: FormGroup;
  alertDays = 30;
  currentLanguageSet: any;
  languageComponent!: SetLanguageComponent;
  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    public dialogRef: MatDialogRef<RxBatchViewComponent>,
    private http_service: LanguageService,
  ) {}
  ngOnInit() {
    this.fetchLanguageResponse();
    console.log(this.items);
    this.itemsForm = this.fb.group({});
    this.loadtoForm(this.items);
  }

  loadtoForm(items: any) {
    const formArray = this.initBatchListArray(items, this.editSelection);
    this.itemsForm?.addControl('formArray', formArray);
    this.setDispensed(formArray.value);
  }
  setDispensed(formArray: any, index = -1) {
    this.checkQuant(formArray, index);
    let quantity = 0;
    formArray.map((arr: any) => (quantity += +arr.quantity));
    console.log(quantity, ' quant');
    console.log(formArray);
    if (quantity <= this.prescribed) {
      this.dispensed = quantity;
    } else if (index >= 0) {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.dispenseQuantityPrescribed,
        'warn',
      );
      const formItems = <FormArray>this.itemsForm?.controls['formArray'];
      const currentGroup: FormGroup = <FormGroup>formItems?.at(index);
      currentGroup.patchValue({
        quantity: null,
      });
    }
  }

  checkQuant(formArrayVals: any, index: any) {
    console.log(formArrayVals, index);
    if (index != -1) {
      if (
        formArrayVals[index].quantity === '' ||
        formArrayVals[index].quantity === null ||
        formArrayVals[index].quantity === 0 ||
        formArrayVals[index].quantity === '0' ||
        formArrayVals[index].quantity === undefined
      ) {
        const formItems = <FormArray>this.itemsForm.controls['formArray'];
        formItems.at(index).patchValue({ selection: false });
      }
    }
  }

  save() {
    const formItems = <FormArray>this.itemsForm.controls['formArray'];

    if (!formItems.invalid) {
      this.dialogRef.close({
        selectionBatchList: formItems.value,
        batchList: formItems.value.filter(
          (item: any) => item.selection == true,
        ),
        dispensed: this.dispensed > 0 ? this.dispensed : null,
      });
    } else {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.detailsRequired,
        'warn',
      );
    }
  }

  enableBatch(val: any, index: any) {
    console.log(val);
    const selection = val.selection;
    this.setEnable(index);
  }

  setEnable(index: any) {
    const formItems = <FormArray>this.itemsForm.controls['formArray'];
    formItems.at(index).patchValue({
      selection: true,
    });
  }

  checkboxChange(event: any, index: any) {
    if (!event.checked) {
      const formItems = <FormArray>this.itemsForm.controls['formArray'];
      const currentGroup: FormGroup = <FormGroup>formItems.at(index);
      currentGroup.patchValue({
        quantity: null,
      });
      this.setDispensed(formItems.value, index);
    }
  }

  initBatchListElement(batch: any, selection: any): FormGroup {
    return this.fb.group({
      expiryDate: batch.expiryDate,
      batchNo: batch.batchNo,
      quantity: batch.quantity,
      quantityInHand: batch.qty || batch.quantityInHand,
      expiresIn: batch.expiresIn,
      itemStockEntryID: batch.itemStockEntryID,
      selection: batch.selection || selection == '1' ? true : false,
    });
  }

  initBatchListArray(batchList: any, selection: any): FormArray {
    const batches: FormArray = this.fb.array([]);
    batchList.forEach((element: any) => {
      batches.push(this.initBatchListElement(element, selection));
    });
    return batches;
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

  getRxBatch(): AbstractControl[] | null {
    const getRxBatch = this.itemsForm.get('formArray');
    return getRxBatch instanceof FormArray ? getRxBatch.controls : null;
  }
  // -----End------
}
