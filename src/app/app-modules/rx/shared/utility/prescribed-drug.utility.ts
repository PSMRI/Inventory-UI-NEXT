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
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

export class PrescribedDrugsUtils {
  constructor(private fb: FormBuilder) {}

  initBatchListElement(batch: any, selection: any): FormGroup {
    return this.fb.group({
      expiryDate: batch.expiryDate,
      batchNo: batch.batchNo,
      quantity: batch.quantity,
      quantityInHand: batch.qty || batch.quantityInHand,
      expiresIn: batch.expiresIn,
      selection: batch.selection && selection === '1' ? true : false,
      itemStockEntryID: batch.itemStockEntryID,
    });
  }

  initBatchListArray(batchList: any, selection: any): FormArray {
    const batches: FormArray = this.fb.array([]);
    batchList.forEach((element: any) => {
      batches.push(this.initBatchListElement(element, selection));
    });
    return batches;
  }

  initPrescribedDrugs(drug: any, selection: any): FormGroup {
    return this.fb.group({
      duration: drug.duration,
      durationUnit: drug.durationUnit,
      durationView: `${drug.duration} ${drug.durationUnit}`,
      dose: drug.dose,
      route: drug.route,
      genericDrugName: drug.genericDrugName,
      drugStrength: drug.drugStrength,
      specialInstruction: drug.specialInstruction,
      qtyDispensed: null,
      qtyPrescribed: drug.qtyPrescribed,
      drugID: drug.drugID,
      drugForm: drug.drugForm,
      frequency: drug.frequency,
      batchList: this.fb.array([]),
      selectionBatchList: this.fb.array([]),
      preDefinedBatchList: this.initBatchListArray(drug.batchList, selection),
    });
  }

  initPrescribedDrugsArray(itemList: any, selection: any): FormArray {
    const drugArray: FormArray = this.fb.array([]);
    if (typeof itemList === 'object') {
      itemList.forEach((element: any) => {
        drugArray.push(this.initPrescribedDrugs(element, selection));
      });
    }
    return drugArray;
  }

  initPrescriptionForm(prescription: any, selection: any): FormGroup {
    return this.fb.group({
      consultantName: prescription.consultantName,
      prescriptionID: prescription.prescriptionID,
      beneficiaryRegID: prescription.beneficiaryRegID,
      visitCode: prescription.visitCode,
      itemList: this.initPrescribedDrugsArray(prescription.itemList, selection),
    });
  }
}
