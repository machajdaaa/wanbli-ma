import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyChallengeCardComponent } from './daily-challenge-card.component';
import { provideTestDefaults } from '../../../../testing/test-providers';

describe('DailyChallengeCardComponent', () => {
  let component: DailyChallengeCardComponent;
  let fixture: ComponentFixture<DailyChallengeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyChallengeCardComponent],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(DailyChallengeCardComponent);
    fixture.componentRef.setInput('challenge', { title: 'Stovka', text: 'Uběhni stovku.', featherCode: '1A1' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
