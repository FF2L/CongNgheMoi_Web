import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-pass',
  standalone:true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './change-pass.component.html',
  styleUrl: './change-pass.component.css'
})
export class ChangePassComponent {
changePassForm: FormGroup;
  loading: boolean = false;
  formSubmitted: boolean = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.changePassForm = this.fb.group({
      password : ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  isSuccess = false;
    
  onChange() {
    if (this.changePassForm.valid) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.formSubmitted = true;
        this.isSuccess = true;
        console.log('Password change successfully');
        this.router.navigateByUrl('/auth');
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
    this.changePassForm.reset();        // clear form inputs
    this.formSubmitted = false;            // reset alert
    this.isSuccess = false;
  }
  
}
