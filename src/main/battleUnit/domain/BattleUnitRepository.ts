import { type BattleUnit } from './BattleUnit';
import { type Position } from './Position';

export interface BattleUnitRepository {
  create(battleUnit: BattleUnit): Promise<void>;

  update(battleUnit: BattleUnit): Promise<void>;

  searchById(id: string): Promise<BattleUnit | null>;

  searchByPosition(position: Position): Promise<BattleUnit | null>;

  searchByPlayerId(playerId: string): Promise<BattleUnit[]>;

  searchAll(): Promise<BattleUnit[]>;
}
