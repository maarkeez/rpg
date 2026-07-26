import { BattleNotFound, type BattleRepository } from '../../domain';

export class BattleFinisher {
  constructor(readonly battleRepository: BattleRepository) {}

  async finish(battleId: string): Promise<string> {
    const battle = await this.battleRepository.searchById(battleId);
    if (!battle) throw new BattleNotFound();

    battle.finishBattle();
    await this.battleRepository.update(battle);

    return battle.toDto().winner!;
  }
}
