import { CommonModule } from '@angular/common';
import { Component, inject} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Userr } from '../../models/user.model'; 
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']

})
export class SidebarComponent {
  router = inject(Router);
  activeIndex = 0;
  user!: Userr;
  userId: string = sessionStorage.getItem('userId')!;
  defaultAvatarUrl = 'https://i1.rgstatic.net/ii/profile.image/1039614412341248-1624874799001_Q512/Meryem-Laval.jpg';

  ngOnInit() {
    const currentUrl = this.router.url;
    this.loadUserData(this.userId!);

    if (currentUrl.includes('/profile')) {
      this.activeIndex = 0;
    }
    else if (currentUrl.includes('/chat')) {
      this.activeIndex = 1;
    } else if (currentUrl.includes('/contacts')) {
      this.activeIndex = 2;
    } else if (currentUrl.includes('/auth')) {
      this.activeIndex = 3;
    }
  }
    constructor(private userService: UserService) {
    }

  onNavigate(index: number) {
    this.activeIndex = index;

    if (index === 0) {
      this.router.navigateByUrl('/profile');
    } else if (index === 1) {
      this.router.navigateByUrl('/chat');
    } else if (index === 2) {
      this.router.navigateByUrl('/contacts');
    } else if (index === 3) {
      this.router.navigateByUrl('/auth', { replaceUrl: true });
    }
  }
  loadUserData(userId: string): void {
    // this.userService.getUserById(userId).subscribe({
    //   next: (res: Userr) => {
    //     this.user = res;
    //     console.log('User data loaded:', this.user);
    //   },
    //   error: (err: any) => {
    //     console.error('Failed to load user:', err);
    //   }
    // });
  }
}

