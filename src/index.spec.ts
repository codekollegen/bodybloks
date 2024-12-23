import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import BodyBlok from '.';

const ORIG_WINDOW_DISPATCH_EVENT = window.dispatchEvent;

describe('Bodyblok class', () => {
  let bodyBlok: BodyBlok;

  afterAll(() => {
    window.dispatchEvent = ORIG_WINDOW_DISPATCH_EVENT;
  });

  beforeEach(() => {
    if (!customElements.get('body-blok')) {
      customElements.define('body-blok', BodyBlok);
    }

    document.body.innerHTML = `<body-blok></body-blok>`;
    bodyBlok = document.querySelector('body-blok') as BodyBlok;
  });

  it('webcomponent should be defined', () => {
    expect(bodyBlok?.shadowRoot?.innerHTML).toMatchInlineSnapshot(`
      "<slot>
            <div class="body-blok"></div>
          </slot>"
    `);
  });

  it('webcomponent should have a body id', () => {
    expect(bodyBlok?.bodyId).toBeTruthy();
  });

  it('webcomponent should receive a parent id', () => {
    bodyBlok?.setAttribute('parent-id', 'some123');
    expect(bodyBlok?.parentId).toEqual('some123');
  });

  it('webcomponent should have attributes with default values', () => {
    expect(bodyBlok?.posX).toBe(0);
    expect(bodyBlok?.posY).toBe(0);
    expect(bodyBlok?.rotate).toBe(0);
    expect(bodyBlok?.scale).toBe(1);
    expect(bodyBlok?.skew).toBe(0);
    expect(bodyBlok?.type).toBe('BODY');
  });

  it('log function should display correctly', () => {
    const spy = vi.spyOn(console, 'log');
    bodyBlok.log('test');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should dispatch knock event', () => {
    const spy = vi.fn();
    document.addEventListener('root.knock', spy);

    const b = new BodyBlok();
    b.parentId = 'root';
    document.body.append(b);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('register function should set commandEvent', () => {
    const b = new BodyBlok();
    b.parentId = 'root';

    b.register({ commandEvent: 'root.command' });

    expect(b.commandEvent).toEqual('root.command');
  });

  it('register function should provide bodyblok information', () => {
    const b = new BodyBlok();
    b.parentId = 'root';

    document.body.append(b);
    b.bodyId = 'mockId';

    const bInfo = b.register({ commandEvent: 'root.command' });

    expect(bInfo.bodyId).toEqual('mockId');
    expect(bInfo.type).toEqual('BODY');
    expect(bInfo.command).toBeDefined();
  });

  it('health function should provide OK', () => {
    expect(bodyBlok.health()).toEqual('OK');
  });

  it('refresh function should rerender component', () => {
    bodyBlok.refresh();
    expect(bodyBlok.shadowRoot.innerHTML).toMatchInlineSnapshot(`
      "<slot>
            <div class="body-blok"></div>
          </slot>"
    `);
  });

  it('command event should be dispatched', () => {
    bodyBlok.parentId = 'root';

    const spy = vi.fn();
    bodyBlok.addEventListener('root.command', spy);

    bodyBlok.register({ commandEvent: 'root.command' });

    bodyBlok.dispatchCommand({
      action: { type: 'ROTATE', degrees: 0 },
      origin: bodyBlok.bodyId,
      targetType: 'HAND',
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
