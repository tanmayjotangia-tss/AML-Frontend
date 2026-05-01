import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth';
import { TokenService } from '../../../core/auth/token';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);

  userRole: string = this.tokenService.getRole()?.replace('_', ' ') || 'USER';

  @Output() toggleMenu = new EventEmitter<void>();

  logout() {
    this.authService.logout().subscribe({
      next: () => console.log('Logout successful'),
      error: () => this.authService.doLocalLogout()
    });
  }
}
