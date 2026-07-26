import { EffectType } from '../../effect/domain';
import {
  BattleUnitIdRequired,
  BattleUnitNotEnoughMana,
  BattleUnitOutOfMovement,
  BattleUnitPlayerIdRequired,
  BattleUnitUnitIdRequired,
} from './BattleUnitError';
import { manhattanDistance, positionsEqual, type Position } from './Position';

export type BattleUnitAbility = {
  abilityId: string;
  cooldownTurnsLeft: number;
};

const MANA_REGEN_RATE = 0.1;

export class BattleUnit {
  readonly #id: string;
  readonly #unitId: string;
  readonly #playerId: string;
  #position: Position;
  readonly #maxHealth: number;
  #remainingHealth: number;
  readonly #maxMana: number;
  #remainingMana: number;
  readonly #movementRange: number;
  #remainingMoveSteps: number;
  #canCastAbility: boolean;
  #abilities: BattleUnitAbility[];

  private constructor(
    id: string,
    unitId: string,
    playerId: string,
    position: Position,
    maxHealth: number,
    remainingHealth: number,
    maxMana: number,
    remainingMana: number,
    movementRange: number,
    remainingMoveSteps: number,
    canCastAbility: boolean,
    abilities: BattleUnitAbility[],
  ) {
    this.#id = id;
    this.#unitId = unitId;
    this.#playerId = playerId;
    this.#position = position;
    this.#maxHealth = maxHealth;
    this.#remainingHealth = remainingHealth;
    this.#maxMana = maxMana;
    this.#remainingMana = remainingMana;
    this.#movementRange = movementRange;
    this.#remainingMoveSteps = remainingMoveSteps;
    this.#canCastAbility = canCastAbility;
    this.#abilities = abilities;
  }

  public static deploy(
    id: string,
    unitId: string,
    playerId: string,
    position: Position,
    maxHealth: number,
    maxMana: number,
    movementRange: number,
    abilityIds: readonly string[],
  ): BattleUnit {
    if (!id) throw new BattleUnitIdRequired();
    if (!unitId) throw new BattleUnitUnitIdRequired();
    if (!playerId) throw new BattleUnitPlayerIdRequired();

    return new BattleUnit(
      id,
      unitId,
      playerId,
      position,
      maxHealth,
      maxHealth,
      maxMana,
      maxMana,
      movementRange,
      movementRange,
      true,
      abilityIds.map((abilityId) => ({ abilityId, cooldownTurnsLeft: 0 })),
    );
  }

  public beginTurn(): void {
    this.#abilities = this.#abilities.map((ability) => ({
      ...ability,
      cooldownTurnsLeft: Math.max(0, ability.cooldownTurnsLeft - 1),
    }));
    this.#remainingMoveSteps = this.#movementRange;
    this.#canCastAbility = true;
    this.#remainingMana = Math.min(this.#maxMana, this.#remainingMana + Math.round(this.#maxMana * MANA_REGEN_RATE));
  }

  public move(destination: Position): void {
    const distance = manhattanDistance(this.#position, destination);
    if (distance > this.#remainingMoveSteps) throw new BattleUnitOutOfMovement();
    this.#position = destination;
    this.#remainingMoveSteps -= distance;
  }

  public payAbilityCost(abilityId: string, cost: number, cooldown: number): void {
    if (this.#remainingMana < cost) throw new BattleUnitNotEnoughMana();
    this.#remainingMana -= cost;
    this.#abilities = this.#abilities.map((ability) =>
      ability.abilityId === abilityId
        ? { ...ability, cooldownTurnsLeft: ability.cooldownTurnsLeft + cooldown }
        : ability,
    );
    this.#canCastAbility = false;
  }

  public receiveEffect(type: EffectType, power: number): void {
    if (type === EffectType.Heal) {
      this.#remainingHealth = Math.min(this.#maxHealth, this.#remainingHealth + power);
    } else {
      this.#remainingHealth = Math.max(0, this.#remainingHealth - power);
    }
  }

  public findAbility(abilityId: string): BattleUnitAbility | undefined {
    return this.#abilities.find((ability) => ability.abilityId === abilityId);
  }

  public isDeployedAt(position: Position): boolean {
    return positionsEqual(this.#position, position);
  }

  public isEnemyOf(other: BattleUnit): boolean {
    return this.#playerId !== other.#playerId;
  }

  public get id(): string {
    return this.#id;
  }

  public get playerId(): string {
    return this.#playerId;
  }

  public get position(): Position {
    return this.#position;
  }

  public get remainingMana(): number {
    return this.#remainingMana;
  }

  public get remainingMoveSteps(): number {
    return this.#remainingMoveSteps;
  }

  public get isDefeated(): boolean {
    return this.#remainingHealth <= 0;
  }

  public toDto(): BattleUnitDTO {
    return {
      id: this.#id,
      unitId: this.#unitId,
      playerId: this.#playerId,
      position: this.#position,
      maxHealth: this.#maxHealth,
      remainingHealth: this.#remainingHealth,
      maxMana: this.#maxMana,
      remainingMana: this.#remainingMana,
      movementRange: this.#movementRange,
      remainingMoveSteps: this.#remainingMoveSteps,
      canCastAbility: this.#canCastAbility,
      abilities: this.#abilities.map((ability) => ({ ...ability })),
      isDefeated: this.isDefeated,
    };
  }
}

export type BattleUnitDTO = {
  id: string;
  unitId: string;
  playerId: string;
  position: Position;
  maxHealth: number;
  remainingHealth: number;
  maxMana: number;
  remainingMana: number;
  movementRange: number;
  remainingMoveSteps: number;
  canCastAbility: boolean;
  abilities: BattleUnitAbility[];
  isDefeated: boolean;
};
