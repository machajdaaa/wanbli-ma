import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PostResponse } from '../../../core/api/generated/models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss'],
  imports: [DatePipe]
})
export class ActivityCardComponent {
  post = input.required<PostResponse>();
}
