import { type PlayerDTO, type PlayerRepository } from '../../domain';

export class PlayerSearcher {
  constructor(readonly playerRepository: PlayerRepository) {}

  async searchById(id: string): Promise<PlayerDTO | null> {
    return (await this.playerRepository.searchById(id))?.toDto() ?? null;
  }
}
