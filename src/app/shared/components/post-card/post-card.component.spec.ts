import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostCardComponent } from './post-card.component';
import { provideTestDefaults } from '../../../../testing/test-providers';
import { PostCardVm } from '../../../core/models/view-models';
import { POST_FEATHER_SAMPLES } from '../../../core/mocks/posts.mock';

const POST: PostCardVm = {
  id: 1,
  author: { id: 2, name: 'Tereza Svobodová', nickname: 'Terka', avatarUrl: null, isMe: false },
  place: null,
  createdAt: '2026-10-11T09:00:00Z',
  feather: POST_FEATHER_SAMPLES[0].feather,
  isGrandChallenge: true,
  metrics: POST_FEATHER_SAMPLES[0].metrics,
  photos: [],
  content: null,
  likeCount: 24,
  likedByMe: false,
  isOwn: false,
};

describe('PostCardComponent', () => {
  let fixture: ComponentFixture<PostCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCardComponent],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(PostCardComponent);
    fixture.componentRef.setInput('post', POST);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('toggles the pírko optimistically', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-pressed]');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain('25');
  });
});
