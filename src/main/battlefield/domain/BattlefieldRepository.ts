import { type Battlefield } from './Battlefield';

export interface BattlefieldRepository {
  create(battlefield: Battlefield): Promise<void>;

  update(battlefield: Battlefield): Promise<void>;

  searchById(id: string): Promise<Battlefield | null>;
}
