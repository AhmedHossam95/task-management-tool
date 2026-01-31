import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NameLettersPipe } from '../../pipes/name-letters-pipe';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-assignee-avatar',
  imports: [NameLettersPipe, UpperCasePipe],
  templateUrl: './assignee-avatar.component.html',
  styleUrl: './assignee-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssigneeAvatarComponent {
  readonly assigneeName = input<string | undefined>();
}
