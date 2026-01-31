import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigneeAvatarComponent } from './assignee-avatar.component';

describe('AssigneeAvatarComponent', () => {
  let component: AssigneeAvatarComponent;
  let fixture: ComponentFixture<AssigneeAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssigneeAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssigneeAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
