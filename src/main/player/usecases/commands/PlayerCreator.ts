import { Player, PlayerAlreadyExists, type PlayerRepository } from '../../domain';

export class PlayerCreator {
  constructor(readonly playerRepository: PlayerRepository) {}

  async create(id: string, type: string, name: string): Promise<void> {
    const existing = await this.playerRepository.searchById(id);
    if (existing) throw new PlayerAlreadyExists();

    const player = Player.create(id, type, name);
    await this.playerRepository.create(player);
  }
}
