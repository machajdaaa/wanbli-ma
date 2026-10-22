import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { provideTestDefaults } from '../../../testing/test-providers';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: provideTestDefaults(),
    }).compileComponents();
    fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
  });

  it('shows field errors instead of submitting an empty form', () => {
    fixture.nativeElement.querySelector('form button[type=submit]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Vyplň přezdívku.');
    expect(fixture.nativeElement.textContent).toContain('Vyplň heslo.');
  });
});
