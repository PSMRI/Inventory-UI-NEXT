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
import { Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDisableFormControl]',
})
export class DisableFormControlDirective {
  // @Input()
  // set disableFormControl(condition: boolean) {
  //   const action = this.ngControl.control.parent.disabled || condition ? 'disable' : 'enable';
  //   if (action == 'disable' && !this.ngControl.control.parent.disabled)
  //     this.ngControl.control.setValue(null);
  //   // this.ngControl.control.markAsTouched();
  //   this.ngControl.control[action]();
  // }
  // constructor(private ngControl: NgControl) {
  // }
}
