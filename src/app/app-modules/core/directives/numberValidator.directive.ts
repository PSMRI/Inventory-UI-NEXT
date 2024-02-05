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
import {
  Directive,
  ElementRef,
  Attribute,
  HostListener,
  Input,
  Injector,
} from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';

@Directive({
  selector:
    '[appAllowMax][formControlName],[appAllowMax][formControl],[appAllowMax][ngModel],[appAllowMax]',
})
export class NumberValidatorDirective {
  @Input()
  public appAllowMax!: number;

  constructor(
    private elementRef: ElementRef,
    private injector: Injector,
  ) {}

  validate(input: any) {
    const max = this.appAllowMax;

    if (+input <= +max) return true;
    else return false;
  }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    const ngControl: any = this.injector.get(NgControl, null) as NgControl;
    const value = event.target.value;

    if (!this.validate(value)) {
      if (ngControl) ngControl.control.setValue(this.lastValue);
      else event.target.value = this.lastValue;
    }

    this.lastValue = event.target.value;
  }

  lastValue = null;
  @HostListener('focus', ['$event'])
  onFocus(event: any) {
    this.lastValue = event.target.value;
  }
  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    event.preventDefault();
  }

  @HostListener('copy', ['$event']) blockCopy(event: KeyboardEvent) {
    event.preventDefault();
  }

  @HostListener('cut', ['$event']) blockCut(event: KeyboardEvent) {
    event.preventDefault();
  }
}
