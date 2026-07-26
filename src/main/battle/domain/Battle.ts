import { BattlePlayerCountInvalid } from './BattleError';

const REQUIRED_PLAYER_COUNT = 2;

export class Battle {
  readonly #id: string;
  #turnQueue: string[];
  #currentRound: number;
  #currentPlayerTurn: string;
  #started: boolean;

  private constructor(id: string, turnQueue: string[], currentRound: number, currentPlayerTurn: string, started: boolean) {
    this.#id = id;
    this.#turnQueue = turnQueue;
    this.#currentRound = currentRound;
    this.#currentPlayerTurn = currentPlayerTurn;
    this.#started = started;
  }

  public static startFirstRound(id: string, playerIds: string[]): Battle {
    if (playerIds.length !== REQUIRED_PLAYER_COUNT) throw new BattlePlayerCountInvalid();
    return new Battle(id, [...playerIds], 1, playerIds[0], true);
  }

  public defeatPlayer(playerId: string): void {
    const wasCurrentPlayerTurn = this.#currentPlayerTurn === playerId;
    const currentIndex = this.#turnQueue.indexOf(playerId);
    this.#turnQueue = this.#turnQueue.filter((id) => id !== playerId);

    if (wasCurrentPlayerTurn && this.#turnQueue.length > 0) {
      const nextIndex = currentIndex % this.#turnQueue.length;
      this.#currentPlayerTurn = this.#turnQueue[nextIndex];
    }
  }

  public advanceTurn(): void {
    const currentIndex = this.#turnQueue.indexOf(this.#currentPlayerTurn);
    const nextIndex = (currentIndex + 1) % this.#turnQueue.length;
    this.#currentPlayerTurn = this.#turnQueue[nextIndex];
    if (nextIndex === 0) this.#currentRound += 1;
  }

  public get id(): string {
    return this.#id;
  }

  public toDto(): BattleDTO {
    return {
      id: this.#id,
      turnQueue: [...this.#turnQueue],
      currentRound: this.#currentRound,
      currentPlayerTurn: this.#currentPlayerTurn,
      started: this.#started,
    };
  }
}

export type BattleDTO = {
  id: string;
  turnQueue: string[];
  currentRound: number;
  currentPlayerTurn: string;
  started: boolean;
};
