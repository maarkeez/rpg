import { BattleNotReadyToFinish, BattlePlayerCountInvalid, BattleRoundNotFinished } from './BattleError';

const REQUIRED_PLAYER_COUNT = 2;
const WINNING_PLAYER_COUNT = 1;

export class Battle {
  readonly #id: string;
  #turnQueue: string[];
  #currentRound: number;
  #currentPlayerTurn: string;
  #started: boolean;
  #roundFinished: boolean;
  #winner: string | null;

  private constructor(
    id: string,
    turnQueue: string[],
    currentRound: number,
    currentPlayerTurn: string,
    started: boolean,
    roundFinished: boolean,
    winner: string | null,
  ) {
    this.#id = id;
    this.#turnQueue = turnQueue;
    this.#currentRound = currentRound;
    this.#currentPlayerTurn = currentPlayerTurn;
    this.#started = started;
    this.#roundFinished = roundFinished;
    this.#winner = winner;
  }

  public static startFirstRound(id: string, playerIds: string[]): Battle {
    if (playerIds.length !== REQUIRED_PLAYER_COUNT) throw new BattlePlayerCountInvalid();
    return new Battle(id, [...playerIds], 1, playerIds[0], true, false, null);
  }

  public finishCurrentPlayerTurn(): void {
    this.#advancePastCurrentTurnHolder(this.#currentPlayerTurn);
  }

  public startNextRound(): void {
    if (!this.#roundFinished) throw new BattleRoundNotFinished();
    this.#roundFinished = false;
    this.#currentRound += 1;
    this.#currentPlayerTurn = this.#turnQueue[0];
  }

  public finishBattle(): void {
    if (this.#turnQueue.length !== WINNING_PLAYER_COUNT) throw new BattleNotReadyToFinish();
    this.#winner = this.#turnQueue[0];
  }

  public defeatPlayer(playerId: string): void {
    const wasCurrentPlayerTurn = this.#currentPlayerTurn === playerId;
    if (wasCurrentPlayerTurn) {
      this.#advancePastCurrentTurnHolder(playerId);
    }
    this.#turnQueue = this.#turnQueue.filter((id) => id !== playerId);
  }

  #advancePastCurrentTurnHolder(playerId: string): void {
    const currentIndex = this.#turnQueue.indexOf(playerId);
    const isLastInQueue = currentIndex === this.#turnQueue.length - 1;
    if (isLastInQueue) {
      this.#roundFinished = true;
    } else {
      this.#currentPlayerTurn = this.#turnQueue[currentIndex + 1];
    }
  }

  public get id(): string {
    return this.#id;
  }

  public get currentPlayerTurn(): string {
    return this.#currentPlayerTurn;
  }

  public toDto(): BattleDTO {
    return {
      id: this.#id,
      turnQueue: [...this.#turnQueue],
      currentRound: this.#currentRound,
      currentPlayerTurn: this.#currentPlayerTurn,
      started: this.#started,
      roundFinished: this.#roundFinished,
      winner: this.#winner,
    };
  }
}

export type BattleDTO = {
  id: string;
  turnQueue: string[];
  currentRound: number;
  currentPlayerTurn: string;
  started: boolean;
  roundFinished: boolean;
  winner: string | null;
};
