import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityCardComponent } from './activity-card.component';
import { provideTestDefaults } from '../../../../testing/test-providers';
import { PostResponse } from '../../../core/api/generated/models';

const POST: PostResponse = {
  id: 1,
  author: { id: 1, nickname: 'Kuba', profilePicture: null },
  challengeId: null,
  commentCount: 0,
  content: null,
  createdAt: '2026-10-11T09:00:00Z',
  imageUrl: null,
  likeCount: 0,
  organisationId: null,
  userEagleFeatherId: 1,
};

describe('ActivityCardComponent', () => {
  let component: ActivityCardComponent;
  let fixture: ComponentFixture<ActivityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityCardComponent],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityCardComponent);
    fixture.componentRef.setInput('post', POST);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
