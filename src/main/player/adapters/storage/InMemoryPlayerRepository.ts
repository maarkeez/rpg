import { type Player, type PlayerRepository } from '../../domain';

export class InMemoryPlayerRepository implements PlayerRepository {
  readonly #players = new Map<string, Player>();

  async create(player: Player): Promise<void> {
    this.#players.set(player.id, player);
  }

  async searchById(id: string): Promise<Player | null> {
    return this.#players.get(id) ?? null;
  }
}
