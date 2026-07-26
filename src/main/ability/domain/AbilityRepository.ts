import { type Ability } from './Ability';

export interface AbilityRepository {
  create(ability: Ability): Promise<void>;

  searchById(id: string): Promise<Ability | null>;
}
