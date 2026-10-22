import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfilePage } from './user-profile.page';
import { provideTestDefaults } from '../../../testing/test-providers';

describe('UserProfilePage', () => {
  let fixture: ComponentFixture<UserProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfilePage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfilePage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
