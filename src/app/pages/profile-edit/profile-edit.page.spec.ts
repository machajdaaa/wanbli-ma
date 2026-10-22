import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileEditPage } from './profile-edit.page';
import { provideTestDefaults } from '../../../testing/test-providers';

describe('ProfileEditPage', () => {
  let fixture: ComponentFixture<ProfileEditPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEditPage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
