import { type BattleRepository } from '../../../battle/domain';
import { FirstRoundStarter } from '../../../battle/usecases/commands/FirstRoundStarter';
import { type PlayerRepository } from '../../../player/domain';
import { PlayerCreator } from '../../../player/usecases/commands/PlayerCreator';
import { type UnitRepository } from '../../../unit/domain';
import { UnitCreator } from '../../../unit/usecases/commands/UnitCreator';
import { type AbilityRepository } from '../../../ability/domain';
import { AbilityCreator } from '../../../ability/usecases/commands/AbilityCreator';
import { type EffectRepository } from '../../../effect/domain';
import { EffectCreator } from '../../../effect/usecases/commands/EffectCreator';
import { type BattleUnitRepository, type Position } from '../../../battleUnit/domain';
import { BattleUnitDeployer } from '../../../battleUnit/usecases/commands/BattleUnitDeployer';
import { type BattlefieldRepository } from '../../../battlefield/domain';
import { BattlefieldInitializer } from '../../../battlefield/usecases/commands/BattlefieldInitializer';

export const KNIGHT_UNIT_ID = 'knight-unit';
export const GOBLIN_UNIT_ID = 'goblin-unit';

export const KNIGHT_ABILITY = {
  id: 'knight-sword-slash',
  name: 'Sword slash',
  emoji: '⚔️',
  description: 'A heavy blow with a longsword',
  cost: 10,
  cooldown: 1,
  effect: { id: 'knight-slash-effect', type: 'DealDamage' as const, power: 25, probability: 100, duration: 0 },
};

export const GOBLIN_ABILITY = {
  id: 'goblin-fire-bolt',
  name: 'Fire bolt',
  emoji: '🔥',
  description: 'Throws a ball of fire',
  cost: 8,
  cooldown: 2,
  effect: { id: 'goblin-fire-bolt-effect', type: 'DealDamage' as const, power: 18, probability: 100, duration: 0 },
};

type UnitTemplate = {
  name: string;
  emoji: string;
  maxHealth: number;
  maxMana: number;
  movementRange: number;
  ability: typeof KNIGHT_ABILITY | typeof GOBLIN_ABILITY;
};

export const UNIT_TEMPLATES: Record<string, UnitTemplate> = {
  [KNIGHT_UNIT_ID]: { name: 'Knight', emoji: '🛡️', maxHealth: 150, maxMana: 30, movementRange: 2, ability: KNIGHT_ABILITY },
  [GOBLIN_UNIT_ID]: { name: 'Goblin', emoji: '👹', maxHealth: 80, maxMana: 40, movementRange: 3, ability: GOBLIN_ABILITY },
};

const SQUAD_COMPOSITION = [KNIGHT_UNIT_ID, GOBLIN_UNIT_ID, GOBLIN_UNIT_ID, GOBLIN_UNIT_ID];

export type BattleInitializerParams = {
  battleId: string;
  battlefieldId: string;
  humanPlayerId: string;
  cpuPlayerId: string;
  rows: number;
  cols: number;
  terrainId: string;
};

export class BattleInitializer {
  constructor(
    readonly battleRepository: BattleRepository,
    readonly playerRepository: PlayerRepository,
    readonly unitRepository: UnitRepository,
    readonly abilityRepository: AbilityRepository,
    readonly effectRepository: EffectRepository,
    readonly battleUnitRepository: BattleUnitRepository,
    readonly battlefieldRepository: BattlefieldRepository,
  ) {}

  async initialize(params: BattleInitializerParams): Promise<void> {
    const { battleId, battlefieldId, humanPlayerId, cpuPlayerId, rows, cols, terrainId } = params;

    await new BattlefieldInitializer(this.battlefieldRepository).initializeUniform(battlefieldId, rows, cols, terrainId);
    await this.#ensureUnitTemplates();

    const playerCreator = new PlayerCreator(this.playerRepository);
    await playerCreator.create(humanPlayerId, 'human', 'Human');
    await playerCreator.create(cpuPlayerId, 'cpu', 'CPU');

    const battleUnitDeployer = new BattleUnitDeployer(
      this.battleUnitRepository,
      this.unitRepository,
      this.playerRepository,
      this.battlefieldRepository,
      battlefieldId,
    );

    const cpuPositions: Position[] = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ];
    for (let i = 0; i < SQUAD_COMPOSITION.length; i++) {
      await battleUnitDeployer.deploy(`cpu-battle-unit-${i + 1}`, SQUAD_COMPOSITION[i], cpuPlayerId, cpuPositions[i]);
    }

    const humanPositions: Position[] = [
      { row: rows - 1, col: cols - 1 },
      { row: rows - 1, col: cols - 2 },
      { row: rows - 2, col: cols - 1 },
      { row: rows - 2, col: cols - 2 },
    ];
    for (let i = 0; i < SQUAD_COMPOSITION.length; i++) {
      await battleUnitDeployer.deploy(`human-battle-unit-${i + 1}`, SQUAD_COMPOSITION[i], humanPlayerId, humanPositions[i]);
    }

    await new FirstRoundStarter(this.battleRepository, this.playerRepository).start(battleId, [humanPlayerId, cpuPlayerId]);
  }

  async #ensureUnitTemplates(): Promise<void> {
    for (const unitId of [KNIGHT_UNIT_ID, GOBLIN_UNIT_ID]) {
      const existing = await this.unitRepository.searchById(unitId);
      if (existing) continue;

      const template = UNIT_TEMPLATES[unitId];
      await new EffectCreator(this.effectRepository).create(
        template.ability.effect.id,
        template.ability.effect.type,
        template.ability.effect.duration,
        template.ability.effect.power,
        template.ability.effect.probability,
      );
      await new AbilityCreator(this.abilityRepository, this.effectRepository).create(
        template.ability.id,
        template.ability.name,
        template.ability.cost,
        template.ability.cooldown,
        [template.ability.effect.id],
        'AdjacentEnemy',
      );
      await new UnitCreator(this.unitRepository, this.abilityRepository).create(
        unitId,
        template.name,
        template.maxHealth,
        template.maxMana,
        [template.ability.id],
        template.movementRange,
      );
    }
  }
}
