import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs';
import { apiUrl } from '../../contants';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  apiUrl = apiUrl;
  isForgotPasswordRoute: boolean = false;
  isChangePasswordRoute: boolean = false;


  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(){
    this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const url = event.url;
      this.isForgotPasswordRoute = url.includes('/auth/forgot-password');
      this.isChangePasswordRoute = url.includes('/auth/change-password');
    });
  }

  ngOnInit() {
    // Kiểm tra xác thực email từ URL
    this.route.queryParams.subscribe(params => {
      if (params['verified']) {
        alert("✅ Xác thực email thành công! Hãy đăng nhập.");
      }
    });
  }

  /**
   * Xác thực tài khoản từ email
   */
  verifyEmail(token: string) {
    this.http.get(`${apiUrl}/auth/verify?token=${encodeURIComponent(token)}`)
      .subscribe({
        next: () => {
          alert("✅ Xác thực email thành công! Hãy đăng nhập.");
          this.router.navigateByUrl("/login");
        },
        error: () => {
          alert("❌ Xác thực thất bại hoặc token đã hết hạn!");
        }
      });
  }

  /**
   * Xử lý đăng nhập
   */
  onLogin() {
    if (this.loginForm.valid) {
      this.http.post(`${apiUrl}/auth/login`, this.loginForm.value)
        .subscribe({
          next: (res: any) => {
            if (res.token) {
              sessionStorage.setItem("token", res.token);
              sessionStorage.setItem('userId',res.userDaLoc._id);
              alert("✅ Đăng nhập thành công!");
              this.router.navigateByUrl("/chat");
              console.log(res.UserDaLoc._id);
            } else {
              alert("❌ Lỗi đăng nhập: " + res.message);
            }
          },
          error: (error) => {
            alert("❌ Đăng nhập thất bại: " + (error.error?.message || "Có lỗi xảy ra!"));
          }
        });
    } else {
      alert("❌ Form đăng nhập không hợp lệ");
    }
  }

  /**
   * Xử lý đăng ký
   */
  onRegister() {
    if (this.registerForm.valid) {
      this.http.post(`${apiUrl}/auth/register`, this.registerForm.value)
        .subscribe({
          next: () => {
            alert("✅ Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.");
          },
          error: (error) => {
            alert("❌ Lỗi đăng ký: " + (error.error?.message || "Có lỗi xảy ra!"));
          }
        });
    } else {
      alert("❌ Form đăng ký không hợp lệ");
    }
  }
  onForgotPassWord(){
    this.router.navigateByUrl('/auth/forgot-password')
  }
  onChangePassWord(){
    this.router.navigateByUrl('/auth/change-password')
  }
}
