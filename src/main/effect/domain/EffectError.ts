export class EffectError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
    Object.setPrototypeOf(this, EffectError.prototype);
  }
}

export class EffectIdRequired extends EffectError {
  constructor() {
    super('EffectIdRequired', 'Effect id is required');
  }
}

export class EffectAlreadyExists extends EffectError {
  constructor() {
    super('EffectAlreadyExists', 'Effect already exists');
  }
}

export class EffectTypeInvalid extends EffectError {
  constructor() {
    super('EffectTypeInvalid', 'Effect type must be Heal or DealDamage');
  }
}

export class EffectDurationOutOfRange extends EffectError {
  constructor() {
    super('EffectDurationOutOfRange', 'Effect duration must be between 0 and 99');
  }
}

export class EffectPowerOutOfRange extends EffectError {
  constructor() {
    super('EffectPowerOutOfRange', 'Effect power must be between 0 and 999');
  }
}

export class EffectProbabilityOutOfRange extends EffectError {
  constructor() {
    super('EffectProbabilityOutOfRange', 'Effect probability must be between 0 and 100');
  }
}
