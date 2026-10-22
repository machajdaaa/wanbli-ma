import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnouncementCardComponent } from './announcement-card.component';
import { provideTestDefaults } from '../../../../testing/test-providers';

describe('AnnouncementCardComponent', () => {
  let fixture: ComponentFixture<AnnouncementCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementCardComponent],
      providers: provideTestDefaults(),
    }).compileComponents();
    fixture = TestBed.createComponent(AnnouncementCardComponent);
    fixture.componentRef.setInput('announcement', {
      id: 1,
      author: { id: 3, name: 'Petr', nickname: 'Petr', avatarUrl: null, isMe: false, isLeader: true },
      createdAt: '2026-10-11T07:00:00Z',
      title: 'Noc s Andersenem',
      text: 'Přespíme v knihovně.',
      imageUrl: null,
      info: null,
      place: null,
    });
    fixture.detectChanges();
  });

  it('renders without the info block when the API has no event details', () => {
    expect(fixture.nativeElement.textContent).toContain('Noc s Andersenem');
    expect(fixture.nativeElement.querySelector('dl')).toBeNull();
  });
});
