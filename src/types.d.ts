type BodyType = 'BODY' | 'HAIR' | 'HEAD' | 'TORSO' | 'ARM' | 'HAND' | 'LEG' | 'FOOT' | 'TAIL' | 'PULLSTRING';
type BodyId = string;

type KnockingBody = {
  health: () => string;
  register: (info: RegistrationInformation) => RegisteredBody;
};

type RegisteredBody = {
  bodyId: BodyId;
  type: BodyType;
  command: (cmd: Command) => boolean;
};

type RegistrationInformation = {
  commandEvent: string;
};

type CommandAction =
  | {
      type: 'MOVE';
      moveX: number;
      moveY: number;
    }
  | {
      type: 'ROTATE';
      degrees: number;
    }
  | { type: 'SCALE'; factor: number }
  | { type: 'SKEW'; factor: number }
  | { type: 'APPEAR' }
  | { type: 'VANISH' };

type Command = {
  action: CommandAction;
  targetType: BodyPartType;
  target?: BodyPartId;
  origin: BodyPartId;
};

// TODO: idea for "higher order" commands that
// combine various commands in a single type
type Behaviour = {
  type: 'RUN' | 'JOY' | 'JUMP' | 'SNEEZE';
  commands: Command[];
};
