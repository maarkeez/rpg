export class PlayerError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
    Object.setPrototypeOf(this, PlayerError.prototype);
  }
}

export class PlayerIdRequired extends PlayerError {
  constructor() {
    super('PlayerIdRequired', 'Player id is required');
  }
}

export class PlayerAlreadyExists extends PlayerError {
  constructor() {
    super('PlayerAlreadyExists', 'Player already exists');
  }
}

export class PlayerNameRequired extends PlayerError {
  constructor() {
    super('PlayerNameRequired', 'Player name is required');
  }
}

export class PlayerNameTooLong extends PlayerError {
  constructor() {
    super('PlayerNameTooLong', 'Player name can not be longer than 50 characters');
  }
}

export class PlayerTypeInvalid extends PlayerError {
  constructor() {
    super('PlayerTypeInvalid', 'Player type must be human or cpu');
  }
}

export class PlayerNotFound extends PlayerError {
  constructor() {
    super('PlayerNotFound', 'Player not found');
  }
}
