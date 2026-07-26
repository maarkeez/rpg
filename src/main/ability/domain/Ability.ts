import {
  AbilityCooldownOutOfRange,
  AbilityCostOutOfRange,
  AbilityEffectsEmpty,
  AbilityIdRequired,
  AbilityNameRequired,
  AbilityNameTooLong,
  AbilityTargetPatternInvalid,
  AbilityTooManyEffects,
} from './AbilityError';

export const enum TargetPattern {
  Self = 'Self',
  AdjacentEnemy = 'AdjacentEnemy',
}

const MAX_NAME_LENGTH = 50;
const MAX_COST = 999;
const MAX_COOLDOWN = 99;
const MAX_EFFECTS = 3;

export class Ability {
  readonly #id: string;
  readonly #name: string;
  readonly #cost: number;
  readonly #cooldown: number;
  readonly #effectIds: string[];
  readonly #targetPattern: TargetPattern;

  private constructor(
    id: string,
    name: string,
    cost: number,
    cooldown: number,
    effectIds: string[],
    targetPattern: TargetPattern,
  ) {
    this.#id = id;
    this.#name = name;
    this.#cost = cost;
    this.#cooldown = cooldown;
    this.#effectIds = effectIds;
    this.#targetPattern = targetPattern;
  }

  public static create(
    id: string,
    name: string,
    cost: number,
    cooldown: number,
    effectIds: string[],
    targetPattern: string,
  ): Ability {
    if (!id) throw new AbilityIdRequired();
    if (!name) throw new AbilityNameRequired();
    if (name.length > MAX_NAME_LENGTH) throw new AbilityNameTooLong();
    if (cost < 0 || cost > MAX_COST) throw new AbilityCostOutOfRange();
    if (cooldown < 0 || cooldown > MAX_COOLDOWN) throw new AbilityCooldownOutOfRange();
    if (effectIds.length === 0) throw new AbilityEffectsEmpty();
    if (effectIds.length > MAX_EFFECTS) throw new AbilityTooManyEffects();
    if (targetPattern !== TargetPattern.Self && targetPattern !== TargetPattern.AdjacentEnemy) {
      throw new AbilityTargetPatternInvalid();
    }
    return new Ability(id, name, cost, cooldown, [...effectIds], targetPattern);
  }

  public get id(): string {
    return this.#id;
  }

  public get cost(): number {
    return this.#cost;
  }

  public get cooldown(): number {
    return this.#cooldown;
  }

  public get effectIds(): readonly string[] {
    return this.#effectIds;
  }

  public get targetPattern(): TargetPattern {
    return this.#targetPattern;
  }

  public toDto(): AbilityDTO {
    return {
      id: this.#id,
      name: this.#name,
      cost: this.#cost,
      cooldown: this.#cooldown,
      effectIds: [...this.#effectIds],
      targetPattern: this.#targetPattern,
    };
  }
}

export type AbilityDTO = {
  id: string;
  name: string;
  cost: number;
  cooldown: number;
  effectIds: string[];
  targetPattern: TargetPattern;
};
