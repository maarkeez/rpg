import { type Effect } from './Effect';

export interface EffectRepository {
  create(effect: Effect): Promise<void>;

  searchById(id: string): Promise<Effect | null>;
}
