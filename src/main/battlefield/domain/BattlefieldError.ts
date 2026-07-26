export class BattlefieldError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
    Object.setPrototypeOf(this, BattlefieldError.prototype);
  }
}

export class BattlefieldNotFound extends BattlefieldError {
  constructor() {
    super('BattlefieldNotFound', 'Battlefield not found');
  }
}
