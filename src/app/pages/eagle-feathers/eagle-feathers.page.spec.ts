import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EagleFeathersPage } from './eagle-feathers.page';

describe('EagleFeathersPage', () => {
  let component: EagleFeathersPage;
  let fixture: ComponentFixture<EagleFeathersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EagleFeathersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
