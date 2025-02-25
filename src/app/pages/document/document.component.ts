import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-document',
  imports: [CommonModule, DatePipe],
  templateUrl: './document.component.html',
  styleUrl: './document.component.css',
})
export class DocumentComponent implements OnInit {
  posts: any[] = [];

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.get();
  }

  delete(id: string) {
    this.postService.deletePost(id).subscribe((response) => {
      console.log(response);
      this.get()
    });
  }
  get() {
    this.postService.getPosts().subscribe((data) => {
      this.posts = data.items; // 'items' contains the records
      console.log(this.posts);
    });
  }
}
