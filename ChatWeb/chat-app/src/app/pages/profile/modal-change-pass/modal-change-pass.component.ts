import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-change-pass',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './modal-change-pass.component.html',
  styleUrls: ['./modal-change-pass.component.css']
})
export class ModalComponent {
  @Input() isOpen = false;
  // @Input() title = '';
  @Output() closeModal = new EventEmitter<void>();

  // close() {
  //   this.closeModal.emit();
  // }

  changeNewPassForm: FormGroup;
    loading: boolean = false;
    formSubmitted: boolean = false;
  
    constructor(private fb: FormBuilder, private router: Router) {
      this.changeNewPassForm = this.fb.group({
        password : ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      });
    }
    
    isSuccess = false;
    
    onChange() {
      if (this.changeNewPassForm.valid) {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.formSubmitted = true;
          this.isSuccess = true;
          console.log('Password change successfully');
    
          setTimeout(() => {
            this.close(); // close the modal after success
          }, 1000);
        }, 2000);
      } else {
        this.formSubmitted = true;
        this.isSuccess = false;
        console.log('Form is invalid');
    
        setTimeout(() => {
          this.formSubmitted = false;
        }, 1000);
      }
    }
    
    close() {
      this.changeNewPassForm.reset();        // clear form inputs
      this.formSubmitted = false;            // reset alert
      this.isSuccess = false;
      this.closeModal.emit();                // notify parent to close modal
    }
    

}

