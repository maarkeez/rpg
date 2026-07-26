import { type Unit } from './Unit';

export interface UnitRepository {
  create(unit: Unit): Promise<void>;

  searchById(id: string): Promise<Unit | null>;
}
