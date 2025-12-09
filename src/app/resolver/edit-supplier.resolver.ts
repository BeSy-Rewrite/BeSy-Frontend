import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { catchError, EMPTY, forkJoin, map, Observable, of } from 'rxjs';
import { AddressResponseDTO, CustomerIdResponseDTO, SupplierResponseDTO } from '../api-services-v2';
import { SuppliersWrapperService } from './../services/wrapper-services/suppliers-wrapper.service';

export interface EditSupplierResolvedData {
  supplier: SupplierResponseDTO;
  supplierAddress?: AddressResponseDTO;
  customerIds?: CustomerIdResponseDTO[];
}

@Injectable({ providedIn: 'root' })
export class EditSupplierResolver implements Resolve<EditSupplierResolvedData | null> {
  constructor(
    private readonly supplierWrapperService: SuppliersWrapperService,
    private readonly router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<EditSupplierResolvedData | null> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/not-found'], { skipLocationChange: true });
      return EMPTY;
    }

    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      this.router.navigate(['/not-found'], { skipLocationChange: true });
      return EMPTY;
    }

    return forkJoin({
      supplier: this.supplierWrapperService.getSupplierById(numericId),
      supplierAddress: this.supplierWrapperService.getSupplierAddress(numericId),
      customerIds: this.supplierWrapperService.getCustomersIdsBySupplierId(numericId),
    }).pipe(
      map(result => result as EditSupplierResolvedData),
      catchError((error: any) => {
        if (error?.status === 404) {
          this.router.navigate(['/not-found'], { skipLocationChange: true });
        } else {
          console.error('Error loading supplier for edit:', error);
          this.router.navigate(['/not-found'], { skipLocationChange: true });
        }
        return of(null);
      })
    );
  }
}
