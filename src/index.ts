import { Attribute, Component } from 'webcjs';
import CommandEvent from './util/CommandEvent';
import getId from './util/getId';

@Component
class BodyBlok extends HTMLElement {
  public override shadowRoot: ShadowRoot;

  public commandEvent = '';
  public registeredBodies: RegisteredBody[] = [];
  public logStyle = 'background: mediumspringgreen; color: darkgreen; padding: 3px; border-radius: 3px;';

  @Attribute()
  public override hidden = false;

  @Attribute()
  public posX = 0;

  @Attribute()
  public posY = 0;

  @Attribute()
  public rotate = 0;

  @Attribute()
  public scale = 1;

  @Attribute()
  public skew = 0;

  @Attribute()
  bodyId = '';

  @Attribute()
  parentId = '';

  @Attribute()
  type: BodyType = 'BODY';

  log(msg: string, additionalPayload?: any) {
    console.log(`%c${msg}`, this.logStyle, {
      bodyId: this.bodyId,
      parentId: this.parentId,
      type: this.type,
      commandEvent: this.commandEvent,
      registeredBodies: this.registeredBodies,
      values: {
        hidden: this.hidden,
        posX: this.posX,
        posY: this.posY,
        rotate: this.rotate,
        scale: this.scale,
        skew: this.skew,
      },
      payload: additionalPayload,
    });
  }

  constructor() {
    super();

    this.shadowRoot = this.attachShadow({ mode: 'closed' });
  }

  connectedCallback() {
    this.bodyId = getId();
    this.knockAtParentsDoor();
    this.initialize();
  }

  knockAtParentsDoor() {
    this.dispatchEvent(
      new CustomEvent<KnockingBody>(`${this.parentId}.knock`, {
        bubbles: true,
        composed: true,
        detail: {
          health: this.health.bind(this),
          register: this.register.bind(this),
        },
      }),
    );
  }

  listenToSlotchange() {
    const slots = this.shadowRoot.querySelectorAll('slot');

    slots.forEach((slot) =>
      slot.addEventListener('slotchange', () => {
        let children = slot?.assignedElements();

        children.forEach((child) => {
          if (!child.hasAttribute('parent-id')) {
            child.setAttribute('parent-id', `${this.bodyId}`);
          }
        });
      }),
    );
  }

  registerChildren() {
    this.shadowRoot.addEventListener(`${this.bodyId}.knock`, (e) => {
      const { detail } = e as CustomEvent<KnockingBody>;

      // the child provides a valid health endpoint
      if (detail.health() === 'OK') {
        // the child gets necessary registration information on runtime
        const registeredBody = detail.register({ commandEvent: `${this.bodyId}.command` });
        this.registeredBodies.push(registeredBody);
      }
    });
  }

  listenToCommands() {
    this.shadowRoot.addEventListener(`${this.bodyId}.command`, (e) => {
      const { command } = e as CommandEvent;

      this.registeredBodies
        .filter((body) => (command.target ? body.bodyId === command.target : body.type === command.targetType))
        ?.forEach((filteredBody) => filteredBody.command(command));
    });
  }

  refresh() {
    this.shadowRoot.innerHTML = this.render();
  }

  initialize() {
    this.listenToCommands();
    this.registerChildren();
    this.shadowRoot.innerHTML = this.render();
    this.listenToSlotchange();
  }

  health() {
    return 'OK';
  }

  // This function is used to recieve registration information from the body
  register({ commandEvent }: RegistrationInformation): RegisteredBody {
    this.commandEvent = commandEvent;

    return {
      bodyId: this.bodyId,
      type: this.type,
      command: this.command.bind(this),
    };
  }

  // This function will be used to recieve commands from the body
  command(cmd: Command) {
    // don't execute the command on element itself
    if (this.bodyId === cmd.origin) {
      return false;
    }

    if (cmd.action.type === 'ROTATE') {
      this.rotate = cmd.action.degrees;
    }

    if (cmd.action.type === 'MOVE') {
      this.posX = cmd.action.moveX;
      this.posY = cmd.action.moveY;
    }

    if (cmd.action.type === 'SCALE') {
      this.scale = cmd.action.factor;
    }

    if (cmd.action.type === 'SKEW') {
      this.skew = cmd.action.factor;
    }

    if (cmd.action.type === 'VANISH') {
      this.hidden = true;
    }

    if (cmd.action.type === 'APPEAR') {
      this.hidden = false;
    }

    return true;
  }

  dispatchCommand(command: Command) {
    this.dispatchEvent(
      new CommandEvent(this.commandEvent, {
        bubbles: true,
        composed: true,
        command,
      }),
    );
  }

  render() {
    return `<slot>
      <div class="body-blok"></div>
    </slot>`;
  }
}

export default BodyBlok;
