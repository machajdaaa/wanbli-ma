import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaderboardRowComponent } from './leaderboard-row.component';
import { provideTestDefaults } from '../../../../testing/test-providers';

describe('LeaderboardRowComponent', () => {
  let fixture: ComponentFixture<LeaderboardRowComponent>;

  const row = (id: number, isMe: boolean) => ({
    rank: 23,
    featherCount: 18,
    person: { id, name: 'Jakub Novák', nickname: 'Kuba', avatarUrl: null, isMe },
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardRowComponent],
      providers: provideTestDefaults(),
    }).compileComponents();
    fixture = TestBed.createComponent(LeaderboardRowComponent);
  });

  it('links real people to their profile and shows "Ty" for the current user', () => {
    fixture.componentRef.setInput('row', row(1, true));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Ty');
  });

  it('does not link mock people (negative ids)', () => {
    fixture.componentRef.setInput('row', row(-5, false));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });
});
