interface CommandEventInit extends CustomEventInit<any> {
  command: Command;
}

class CommandEvent extends CustomEvent<any> {
  public command: Command;

  constructor(type: string, eventInitDict: CommandEventInit) {
    super(type, eventInitDict);
    this.command = eventInitDict.command;
  }
}

export default CommandEvent;
