import { type Battle } from './Battle';

export interface BattleRepository {
  create(battle: Battle): Promise<void>;

  update(battle: Battle): Promise<void>;

  searchById(id: string): Promise<Battle | null>;
}
