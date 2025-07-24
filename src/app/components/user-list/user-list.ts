import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserList implements OnInit {
  users: any[] = [];
  destroy = new Subject<void>();

  currentPage = 1;
  searchTerm: string = '';
  pageSize = 5;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getUsers();
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  private getUsers() {
    this.isLoading = true;
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.sortBy('name');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          this.isLoading = false;
        }
      });
  }

  goToUser(id: number) {
    this.router.navigate(['/user', id]);
  }

  get totalPages(): number {
    return Math.ceil(this.users.length / this.pageSize);
  }

  getFilteredUsers(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    const filtered = !term
      ? this.users
      : this.users.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );

    // Reset to page 1 if currentPage exceeds total pages
    const maxPage = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > maxPage) {
      this.currentPage = 1;
    }

    return filtered;
  }

  paginatedUsers(): any[] {
    const filtered = this.getFilteredUsers();
    const sorted = this.getSortedUsers(filtered);
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedUsers(users: any[]): any[] {
    if (!this.sortColumn) return users;

    return [...users].sort((a, b) => {
      const valA = a[this.sortColumn].toLowerCase();
      const valB = b[this.sortColumn].toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

}
