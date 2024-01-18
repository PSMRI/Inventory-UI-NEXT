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
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './services/auth-guard.service';
import { BatchSearchService } from './services/batch-search.service';
import { BeneficiaryDetailsService } from './services/beneficiary-details.service';
import { CommonService } from './services/common-services.service';
import { ConfirmationService } from './services/confirmation.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { HttpInterceptor } from './services/http-interceptor.service';
import { ItemSearchService } from './services/item-search.service';
import { BatchViewService } from './services/rx-batchview.service';
import { SpinnerService } from './services/spinner.service';
import { SetLanguageComponent } from './components/set-language.component';
import { CommonDialogComponent } from './components/common-dialog/common-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MaterialModule } from './material.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
    MaterialModule,
    // Md2Module,
    RouterModule,
    FormsModule,
    MatDialogModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatDatepickerModule,

    // Ng2GoogleChartsModule,
  ],
  declarations: [
    CommonDialogComponent,
    // TextareaDialogComponent,
    // SpinnerComponent,
    // AppFooterComponent,
    // AppHeaderComponent,
    // myEmail,
    // myMobileNumber,
    SetLanguageComponent,
    // myName,
    // myPassword,
    // StringValidator,
    // NullDefaultValueDirective,
    // NumberValidator,
    // DisableFormControlDirective,
    // ItemSearchComponent,
    // ItemSearchDirective,
    // MinNumberValidator,
    // TransferSearchComponent,
    // ItemTransferDirective,
    // BatchSearchComponent,
    // BatchSearchDirective,
    // ItemDispenseDirective,
    // ItemDispenseComponent,
    // SearchComponent,
    // SetLanguageComponent,
    // ISTDatePipe,
    // BatchAdjustmentDirective,
    // BatchAdjustmentComponent,
    // BeneficiaryDetailsComponent,
    //  RxBatchViewComponent,
    // IndentRequestDirective,
    // IndentItemListComponent,
    // IndentDispenseDirective,
    // ShowCommitAndVersionDetailsComponent
  ],
  exports: [
    MaterialModule,
    // Md2Module,
    CommonDialogComponent,
    // TextareaDialogComponent,
    // SpinnerComponent,
    // SetLanguageComponent,
    // ReactiveFormsModule,
    // AppFooterComponent,
    // AppHeaderComponent,
    // Ng2GoogleChartsModule,
    // myEmail,
    SetLanguageComponent,
    // myMobileNumber,
    // myName,
    // myPassword,
    // DisableFormControlDirective,
    // StringValidator,
    // NumberValidator,
    // MinNumberValidator,
    // NullDefaultValueDirective,
    // ItemSearchComponent,
    // ItemSearchDirective,
    // TransferSearchComponent,
    // ItemTransferDirective,
    // ItemDispenseDirective,
    // BatchSearchComponent,
    // BatchSearchDirective,
    // ISTDatePipe,
    // BatchAdjustmentComponent,
    // BatchAdjustmentDirective,
    // BeneficiaryDetailsComponent,
    // IndentRequestDirective,
    // IndentItemListComponent,
    // IndentDispenseDirective,
    // ShowCommitAndVersionDetailsComponent
  ],
  // entryComponents: [
  //   CommonDialogComponent,
  //   ItemSearchComponent,
  //   TransferSearchComponent,
  //   BatchSearchComponent,
  //   BatchAdjustmentComponent,
  //   TextareaDialogComponent,
  //   ItemDispenseComponent,
  //   SpinnerComponent,
  //   SearchComponent,
  //  RxBatchViewComponent,
  //   IndentItemListComponent,
  //   ShowCommitAndVersionDetailsComponent
  // ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ConfirmationService,
        HttpInterceptor,
        BatchViewService,
        // TextareaDialog,
        AuthGuard,
        SpinnerService,
        CommonService,
        ItemSearchService,
        BatchSearchService,
        BeneficiaryDetailsService,
        // {
        //   // provide: Http,
        //   // useFactory: HttpInterceptorFactory,
        //   deps: [XHRBackend, RequestOptions, Router, SpinnerService, ConfirmationService]
        // }
      ],
    };
  }
}

// export function HttpInterceptorFactory(backend: XHRBackend, options: RequestOptions, router: Router, spinner: SpinnerService, confirmation: ConfirmationService, http_service: LanguageService) {
//   return new HttpInterceptor(backend, options, router, spinner, confirmation, http_service);
// }
