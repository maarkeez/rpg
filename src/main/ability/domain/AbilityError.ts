export class AbilityError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
    Object.setPrototypeOf(this, AbilityError.prototype);
  }
}

export class AbilityIdRequired extends AbilityError {
  constructor() {
    super('AbilityIdRequired', 'Ability id is required');
  }
}

export class AbilityAlreadyExists extends AbilityError {
  constructor() {
    super('AbilityAlreadyExists', 'Ability already exists');
  }
}

export class AbilityNameRequired extends AbilityError {
  constructor() {
    super('AbilityNameRequired', 'Ability name is required');
  }
}

export class AbilityNameTooLong extends AbilityError {
  constructor() {
    super('AbilityNameTooLong', 'Ability name can not be longer than 50 characters');
  }
}

export class AbilityCostOutOfRange extends AbilityError {
  constructor() {
    super('AbilityCostOutOfRange', 'Ability cost must be between 0 and 999');
  }
}

export class AbilityCooldownOutOfRange extends AbilityError {
  constructor() {
    super('AbilityCooldownOutOfRange', 'Ability cooldown must be between 0 and 99');
  }
}

export class AbilityEffectsEmpty extends AbilityError {
  constructor() {
    super('AbilityEffectsEmpty', 'Ability must have at least one effect');
  }
}

export class AbilityTooManyEffects extends AbilityError {
  constructor() {
    super('AbilityTooManyEffects', 'Ability can not have more than 3 effects');
  }
}

export class AbilityEffectNotFound extends AbilityError {
  constructor() {
    super('AbilityEffectNotFound', 'One or more ability effects do not exist');
  }
}

export class AbilityTargetPatternInvalid extends AbilityError {
  constructor() {
    super('AbilityTargetPatternInvalid', 'Ability target pattern is invalid');
  }
}

export class AbilityNotFound extends AbilityError {
  constructor() {
    super('AbilityNotFound', 'Ability not found');
  }
}
