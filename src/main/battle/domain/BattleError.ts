export class BattleError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
    Object.setPrototypeOf(this, BattleError.prototype);
  }
}

export class BattleAlreadyExists extends BattleError {
  constructor() {
    super('BattleAlreadyExists', 'Battle already exists');
  }
}

export class BattlePlayerNotFound extends BattleError {
  constructor() {
    super('BattlePlayerNotFound', 'One or more players do not exist');
  }
}

export class BattlePlayerCountInvalid extends BattleError {
  constructor() {
    super('BattlePlayerCountInvalid', 'A battle requires exactly two players');
  }
}

export class BattleNotFound extends BattleError {
  constructor() {
    super('BattleNotFound', 'Battle not found');
  }
}

export class BattlePlayerStillHasUnitsAlive extends BattleError {
  constructor() {
    super('BattlePlayerStillHasUnitsAlive', 'The player still has battle units alive');
  }
}
