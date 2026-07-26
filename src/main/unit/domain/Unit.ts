import {
  UnitAbilitiesEmpty,
  UnitIdRequired,
  UnitMaxHealthOutOfRange,
  UnitMaxManaOutOfRange,
  UnitMovementRangeOutOfRange,
  UnitNameRequired,
  UnitNameTooLong,
  UnitTooManyAbilities,
} from './UnitError';

const MAX_NAME_LENGTH = 50;
const MAX_HEALTH = 999;
const MAX_MANA = 999;
const MAX_ABILITIES = 6;
const MAX_MOVEMENT_RANGE = 99;

export class Unit {
  readonly #id: string;
  readonly #name: string;
  readonly #maxHealth: number;
  readonly #maxMana: number;
  readonly #abilityIds: string[];
  readonly #movementRange: number;

  private constructor(
    id: string,
    name: string,
    maxHealth: number,
    maxMana: number,
    abilityIds: string[],
    movementRange: number,
  ) {
    this.#id = id;
    this.#name = name;
    this.#maxHealth = maxHealth;
    this.#maxMana = maxMana;
    this.#abilityIds = abilityIds;
    this.#movementRange = movementRange;
  }

  public static create(
    id: string,
    name: string,
    maxHealth: number,
    maxMana: number,
    abilityIds: string[],
    movementRange: number,
  ): Unit {
    if (!id) throw new UnitIdRequired();
    if (!name) throw new UnitNameRequired();
    if (name.length > MAX_NAME_LENGTH) throw new UnitNameTooLong();
    if (maxHealth < 0 || maxHealth > MAX_HEALTH) throw new UnitMaxHealthOutOfRange();
    if (maxMana < 0 || maxMana > MAX_MANA) throw new UnitMaxManaOutOfRange();
    if (abilityIds.length === 0) throw new UnitAbilitiesEmpty();
    if (abilityIds.length > MAX_ABILITIES) throw new UnitTooManyAbilities();
    if (movementRange < 0 || movementRange > MAX_MOVEMENT_RANGE) throw new UnitMovementRangeOutOfRange();
    return new Unit(id, name, maxHealth, maxMana, [...abilityIds], movementRange);
  }

  public get id(): string {
    return this.#id;
  }

  public get name(): string {
    return this.#name;
  }

  public get maxHealth(): number {
    return this.#maxHealth;
  }

  public get maxMana(): number {
    return this.#maxMana;
  }

  public get abilityIds(): readonly string[] {
    return this.#abilityIds;
  }

  public get movementRange(): number {
    return this.#movementRange;
  }

  public toDto(): UnitDTO {
    return {
      id: this.#id,
      name: this.#name,
      maxHealth: this.#maxHealth,
      maxMana: this.#maxMana,
      abilityIds: [...this.#abilityIds],
      movementRange: this.#movementRange,
    };
  }
}

export type UnitDTO = {
  id: string;
  name: string;
  maxHealth: number;
  maxMana: number;
  abilityIds: string[];
  movementRange: number;
};
