import { Battle, BattleAlreadyExists, BattlePlayerNotFound, type BattleRepository } from '../../domain';
import { type PlayerRepository } from '../../../player/domain';

export class FirstRoundStarter {
  constructor(
    readonly battleRepository: BattleRepository,
    readonly playerRepository: PlayerRepository,
  ) {}

  async start(battleId: string, playerIds: string[]): Promise<void> {
    const existing = await this.battleRepository.searchById(battleId);
    if (existing) throw new BattleAlreadyExists();

    for (const playerId of playerIds) {
      const player = await this.playerRepository.searchById(playerId);
      if (!player) throw new BattlePlayerNotFound();
    }

    const battle = Battle.startFirstRound(battleId, playerIds);
    await this.battleRepository.create(battle);
  }
}
