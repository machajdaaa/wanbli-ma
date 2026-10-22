import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPage } from './settings.page';
import { provideTestDefaults } from '../../../testing/test-providers';

describe('SettingsPage', () => {
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
