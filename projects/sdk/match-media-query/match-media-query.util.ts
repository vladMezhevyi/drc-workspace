import { effect, signal, Signal } from '@angular/core';
import { distinctUntilChanged, Observable, shareReplay } from 'rxjs';

export const matchMediaQuery = (query: string): Signal<boolean> => {
  const mediaQueryList: MediaQueryList = window.matchMedia(query);
  const matches = signal<boolean>(mediaQueryList.matches);

  effect((onCleanup) => {
    const listener = (e: MediaQueryListEvent) => matches.set(e.matches);
    mediaQueryList.addEventListener('change', listener);

    onCleanup(() => {
      mediaQueryList.removeEventListener('change', listener);
    });
  });

  return matches.asReadonly();
};

export const matchMediaQuery$ = (query: string): Observable<boolean> => {
  const mediaQueryList: MediaQueryList = window.matchMedia(query);

  const observable$: Observable<boolean> = new Observable((subscriber) => {
    const listener = (e: MediaQueryListEvent) => subscriber.next(e.matches);
    subscriber.next(mediaQueryList.matches);

    mediaQueryList.addEventListener('change', listener);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  });

  return observable$.pipe(distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));
};
