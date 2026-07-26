import { PlayerIdRequired, PlayerNameRequired, PlayerNameTooLong, PlayerTypeInvalid } from './PlayerError';

export const enum PlayerType {
  Human = 'human',
  Cpu = 'cpu',
}

const MAX_NAME_LENGTH = 50;

export class Player {
  readonly #id: string;
  readonly #type: PlayerType;
  readonly #name: string;

  private constructor(id: string, type: PlayerType, name: string) {
    this.#id = id;
    this.#type = type;
    this.#name = name;
  }

  public static create(id: string, type: string, name: string): Player {
    if (!id) throw new PlayerIdRequired();
    if (!name) throw new PlayerNameRequired();
    if (name.length > MAX_NAME_LENGTH) throw new PlayerNameTooLong();
    if (type !== PlayerType.Human && type !== PlayerType.Cpu) throw new PlayerTypeInvalid();
    return new Player(id, type, name);
  }

  public get id(): string {
    return this.#id;
  }

  public toDto(): PlayerDTO {
    return { id: this.#id, type: this.#type, name: this.#name };
  }
}

export type PlayerDTO = {
  id: string;
  type: PlayerType;
  name: string;
};
