export class UnitError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
    Object.setPrototypeOf(this, UnitError.prototype);
  }
}

export class UnitIdRequired extends UnitError {
  constructor() {
    super('UnitIdRequired', 'Unit id is required');
  }
}

export class UnitAlreadyExists extends UnitError {
  constructor() {
    super('UnitAlreadyExists', 'Unit already exists');
  }
}

export class UnitNameRequired extends UnitError {
  constructor() {
    super('UnitNameRequired', 'Unit name is required');
  }
}

export class UnitNameTooLong extends UnitError {
  constructor() {
    super('UnitNameTooLong', 'Unit name can not be longer than 50 characters');
  }
}

export class UnitMaxHealthOutOfRange extends UnitError {
  constructor() {
    super('UnitMaxHealthOutOfRange', 'Unit maximum health must be between 0 and 999');
  }
}

export class UnitMaxManaOutOfRange extends UnitError {
  constructor() {
    super('UnitMaxManaOutOfRange', 'Unit maximum mana must be between 0 and 999');
  }
}

export class UnitAbilitiesEmpty extends UnitError {
  constructor() {
    super('UnitAbilitiesEmpty', 'Unit must have at least one ability');
  }
}

export class UnitTooManyAbilities extends UnitError {
  constructor() {
    super('UnitTooManyAbilities', 'Unit can not have more than 6 abilities');
  }
}

export class UnitAbilityNotFound extends UnitError {
  constructor() {
    super('UnitAbilityNotFound', 'One or more unit abilities do not exist');
  }
}

export class UnitMovementRangeOutOfRange extends UnitError {
  constructor() {
    super('UnitMovementRangeOutOfRange', 'Unit movement range must be between 0 and 99');
  }
}

export class UnitNotFound extends UnitError {
  constructor() {
    super('UnitNotFound', 'Unit not found');
  }
}
