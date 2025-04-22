import { Component, OnInit } from '@angular/core';
import { Userr } from '../../models/user.model';
import { ModalComponent } from './modal-change-pass/modal-change-pass.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';


@Component({
  standalone:true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports:[ModalComponent,CommonModule,
    FormsModule,ReactiveFormsModule]
})
export class ProfileComponent implements OnInit {
  user?: Userr;
  userId: string | null  = sessionStorage.getItem('userId')
  showModal = false;
  defaultAvatarUrl = 'https://i1.rgstatic.net/ii/profile.image/1039614412341248-1624874799001_Q512/Meryem-Laval.jpg';
  infoChangeForm: FormGroup;
  loading: boolean = false;
  formSubmitted: boolean = false;


  constructor(private fb: FormBuilder, private userService: UserService) {
    this.infoChangeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.loadUserData(userId);
    }
  }

  loadUserData(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (res: Userr) => {
        this.user = res;
        this.patchUserInfo();
        console.log('User data loaded:', this.user);
      },
      error: (err) => {
        console.error('Failed to load user:', err);
      }
    });
  }


  toggleModal(): void {
    this.showModal = !this.showModal;
  }


  patchUserInfo() {
    this.infoChangeForm.patchValue({
      name: this.user?.name,
      email: this.user?.email,
      phone: this.user?.phone,
      address: this.user?.address
    });
  }


  isSuccess = false;
    
  saveChanges() {
    if (this.infoChangeForm.valid) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.formSubmitted = true;
        this.isSuccess = true;
        console.log('Change info successfully');
        // Optionally, reset formSubmitted and isSuccess after displaying the success message for a while
        setTimeout(() => {
          this.formSubmitted = false;
          this.isSuccess = false;
        }, 3000); // for example, show success for 3 seconds
      }, 2000);
    } else {
      this.formSubmitted = true;
      this.isSuccess = false;
      console.log('Form is invalid');
  
      setTimeout(() => {
        this.formSubmitted = false;
        this.isSuccess = false;
      }, 1000); // Cleanup after 1 second
    }
  }
}
