import { type Player } from './Player';

export interface PlayerRepository {
  create(player: Player): Promise<void>;

  searchById(id: string): Promise<Player | null>;
}
