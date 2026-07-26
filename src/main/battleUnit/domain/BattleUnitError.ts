export class BattleUnitError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
    Object.setPrototypeOf(this, BattleUnitError.prototype);
  }
}

export class BattleUnitIdRequired extends BattleUnitError {
  constructor() {
    super('BattleUnitIdRequired', 'Battle unit id is required');
  }
}

export class BattleUnitUnitIdRequired extends BattleUnitError {
  constructor() {
    super('BattleUnitUnitIdRequired', 'Unit id is required');
  }
}

export class BattleUnitPlayerIdRequired extends BattleUnitError {
  constructor() {
    super('BattleUnitPlayerIdRequired', 'Player id is required');
  }
}

export class BattleUnitAlreadyDeployed extends BattleUnitError {
  constructor() {
    super('BattleUnitAlreadyDeployed', 'Battle unit is already deployed');
  }
}

export class BattleUnitUnitNotFound extends BattleUnitError {
  constructor() {
    super('BattleUnitUnitNotFound', 'Unit does not exist');
  }
}

export class BattleUnitPlayerNotFound extends BattleUnitError {
  constructor() {
    super('BattleUnitPlayerNotFound', 'Player does not exist');
  }
}

export class BattleUnitPositionOccupied extends BattleUnitError {
  constructor() {
    super('BattleUnitPositionOccupied', 'Battlefield position is already occupied');
  }
}

export class BattleUnitNotFound extends BattleUnitError {
  constructor() {
    super('BattleUnitNotFound', 'Battle unit is not deployed');
  }
}

export class BattleUnitOutOfMovement extends BattleUnitError {
  constructor() {
    super('BattleUnitOutOfMovement', 'Battle unit does not have enough movement left');
  }
}

export class BattleUnitUnknownAbility extends BattleUnitError {
  constructor() {
    super('BattleUnitUnknownAbility', 'Battle unit does not have that ability');
  }
}

export class BattleUnitAbilityOnCooldown extends BattleUnitError {
  constructor() {
    super('BattleUnitAbilityOnCooldown', 'Ability is on cooldown');
  }
}

export class BattleUnitNotEnoughMana extends BattleUnitError {
  constructor() {
    super('BattleUnitNotEnoughMana', 'Battle unit does not have enough mana');
  }
}

export class BattleUnitTargetNotDeployed extends BattleUnitError {
  constructor() {
    super('BattleUnitTargetNotDeployed', 'Targeted battle unit is not deployed');
  }
}

export class BattleUnitInvalidTargets extends BattleUnitError {
  constructor() {
    super('BattleUnitInvalidTargets', 'Targets do not match the ability target pattern');
  }
}
