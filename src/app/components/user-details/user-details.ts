import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-details',
  imports: [
    CommonModule
  ],
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss'
})
export class UserDetails implements OnInit, OnDestroy {
  user: any = null;
  destroy = new Subject<void>();
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = Number(params.get('id'));
      this.getUser(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  private getUser(id: number): void {
    this.isLoading = true;
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (users) => {
          this.user = users.find(u => u.id === id);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching user:', error);
          this.isLoading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/user']);
  }
}
