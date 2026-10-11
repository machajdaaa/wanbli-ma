import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPage, ageOn } from './register.page';
import { provideTestDefaults } from '../../../testing/test-providers';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: provideTestDefaults(),
    }).compileComponents();
    fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('computes age in full years around the birthday', () => {
    const today = new Date(2026, 9, 11);
    expect(ageOn('2011-10-11', today)).toBe(15);
    expect(ageOn('2011-10-12', today)).toBe(14);
    expect(ageOn('not-a-date', today)).toBeNull();
  });
});
