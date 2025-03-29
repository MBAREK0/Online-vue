import { Injectable } from "@angular/core";
import { Dialog } from "@angular/cdk/dialog";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { ConfirmationDialogComponent } from "../../shared/components/confirmation-dialog/confirmation-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  constructor(private dialog: Dialog) {}

  confirm(title: string, message: string, type?: 'delete' | 'archive' | 'info'): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: { title, message, type },
      hasBackdrop: false  // This will remove the backdrop
    });

    return dialogRef.closed.pipe(
      map(result => result === true)  // Explicitly convert to boolean
    );
  }
}
