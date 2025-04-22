import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-forget-password',
  standalone:true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  forgetPassForm: FormGroup;
  loading: boolean = false;
  formSubmitted: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.forgetPassForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  isSuccess = false;
    
  onReset() {
    if (this.forgetPassForm.valid) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.formSubmitted = true;
        this.isSuccess = true;
        console.log('Sent email successfully');
        setTimeout(()=>{
          this.router.navigate(['../change-password'], { relativeTo: this.route });},2000
        )
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
    this.forgetPassForm.reset();        // clear form inputs
    this.formSubmitted = false;            // reset alert
    this.isSuccess = false;
  }
  
}
