import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post/post.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
})
export class DocumentComponent implements OnInit {
  posts: any[] = [];

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.get();
  }

  get() {
    this.postService.getPosts().subscribe((data) => {
      this.posts = data.items; // PocketBase returns { items, page, perPage, ... }
      console.log('Fetched docs:', this.posts);
    });
  }

  delete(id: string) {
    this.postService.deletePost(id).subscribe(() => {
      console.log('Deleted doc:', id);
      this.get(); // refetch list
    });
  }
}
