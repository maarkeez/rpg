import {
  EffectDurationOutOfRange,
  EffectIdRequired,
  EffectPowerOutOfRange,
  EffectProbabilityOutOfRange,
  EffectTypeInvalid,
} from './EffectError';

export const enum EffectType {
  Heal = 'Heal',
  DealDamage = 'DealDamage',
}

const MAX_DURATION = 99;
const MAX_POWER = 999;
const MAX_PROBABILITY = 100;

export class Effect {
  readonly #id: string;
  readonly #type: EffectType;
  readonly #duration: number;
  readonly #power: number;
  readonly #probability: number;

  private constructor(id: string, type: EffectType, duration: number, power: number, probability: number) {
    this.#id = id;
    this.#type = type;
    this.#duration = duration;
    this.#power = power;
    this.#probability = probability;
  }

  public static create(
    id: string,
    type: string,
    duration: number,
    power: number,
    probability: number,
  ): Effect {
    if (!id) throw new EffectIdRequired();
    if (type !== EffectType.Heal && type !== EffectType.DealDamage) throw new EffectTypeInvalid();
    if (duration < 0 || duration > MAX_DURATION) throw new EffectDurationOutOfRange();
    if (power < 0 || power > MAX_POWER) throw new EffectPowerOutOfRange();
    if (probability < 0 || probability > MAX_PROBABILITY) throw new EffectProbabilityOutOfRange();
    return new Effect(id, type, duration, power, probability);
  }

  public get id(): string {
    return this.#id;
  }

  public get type(): EffectType {
    return this.#type;
  }

  public get power(): number {
    return this.#power;
  }

  public get probability(): number {
    return this.#probability;
  }

  public toDto(): EffectDTO {
    return {
      id: this.#id,
      type: this.#type,
      duration: this.#duration,
      power: this.#power,
      probability: this.#probability,
    };
  }
}

export type EffectDTO = {
  id: string;
  type: EffectType;
  duration: number;
  power: number;
  probability: number;
};
