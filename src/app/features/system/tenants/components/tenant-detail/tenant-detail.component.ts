import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantResponseDto } from '../../../../../core/models/tenant.model';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-detail.component.html',
  styleUrls: ['./tenant-detail.component.css']
})
export class TenantDetailComponent {
  @Input() tenant!: TenantResponseDto;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<TenantResponseDto>();
  @Output() statusChanged = new EventEmitter<void>();

}
