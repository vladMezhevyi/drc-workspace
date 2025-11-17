import { Directive, ElementRef, inject, input, InputSignal, output } from '@angular/core';

@Directive({
  selector: '[drcClickableArea]',
  host: {
    '(click)': 'onClick($event)',
    tabindex: '0',
  },
})
export class DrcClickableArea {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  // Inputs
  public readonly enabled = input<boolean>(true, { alias: '[drcClickableArea]' });
  public readonly interactiveSelectors = input<string[]>([]);

  // Outputs
  public readonly areaClick = output<MouseEvent>();

  // Constants
  private readonly INTERACTIVE_TAGS = new Set([
    'button',
    'a',
    'input',
    'select',
    'textarea',
    'label',
  ]);

  private readonly INTERACTIVE_ROLES = new Set([
    'button',
    'link',
    'checkbox',
    'radio',
    'switch',
    'tab',
    'menuitem',
    'option',
  ]);

  protected onClick(e: MouseEvent): void {
    if (!this.enabled()) return;

    const selection: string | undefined = this.getSelection();
    if (selection?.length) return;

    if (this.isInteractiveElement(e.target as HTMLElement)) return;

    this.areaClick.emit(e);
  }

  private getSelection(): string | undefined {
    return window.getSelection()?.toString();
  }

  private isInteractiveElement(el: HTMLElement | null): boolean {
    if (!el) return false;
    return this.hasInteractiveAncestor(el);
  }

  private hasInteractiveAncestor(el: HTMLElement): boolean {
    const areaEl: HTMLElement = this.hostEl.nativeElement;
    let currentEl: HTMLElement | null = el;

    while (currentEl && currentEl !== areaEl) {
      const tagName: string = currentEl.tagName.toLowerCase();
      if (this.INTERACTIVE_TAGS.has(tagName)) return true;

      const role: string | null = currentEl.getAttribute('role');
      if (role && this.INTERACTIVE_ROLES.has(role)) return true;

      if (currentEl.hasAttribute('data-interactive')) return true;

      if (currentEl.contentEditable) return true;

      const interactiveSelectors: string[] = this.interactiveSelectors();
      if (interactiveSelectors.some((selector) => currentEl?.matches(selector))) return true;

      currentEl = currentEl.parentElement;
    }

    return false;
  }
}
