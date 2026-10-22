import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = TestBed.inject(ToastService);
  });

  it('auto-dismisses a success toast', fakeAsync(() => {
    service.success('Uloženo');
    expect(service.current()?.message).toBe('Uloženo');
    tick(3000);
    expect(service.current()).toBeNull();
  }));

  it('keeps an error toast with a retry action until dismissed', fakeAsync(() => {
    service.error('Chyba', () => undefined);
    tick(10000);
    expect(service.current()?.kind).toBe('error');
    service.dismiss();
    expect(service.current()).toBeNull();
  }));

  it('replaces the current toast and ignores stale dismiss timers', fakeAsync(() => {
    service.success('První');
    tick(2000);
    service.success('Druhý');
    tick(1500);
    expect(service.current()?.message).toBe('Druhý');
    tick(1500);
    expect(service.current()).toBeNull();
  }));
});
