import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      // Check if route is restricted by role
      if (route.data && route.data['roles']) {
        const allowedRoles = route.data['roles'] as string[];
        if (!allowedRoles.includes(currentUser.role)) {
          // Role not authorised, redirect to their home page based on role
          this.redirectUserToDefaultDashboard(currentUser.role);
          return false;
        }
      }
      // Authorised
      return true;
    }

    // Not logged in, redirect to login page with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  private redirectUserToDefaultDashboard(role: string): void {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'Project Manager':
        this.router.navigate(['/dashboard/manager']);
        break;
      case 'Site Engineer':
        this.router.navigate(['/dashboard/engineer']);
        break;
      case 'Contractor':
        this.router.navigate(['/dashboard/contractor']);
        break;
      case 'Client':
        this.router.navigate(['/dashboard/client']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
