import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { BattleUnitDeployer } from '../../../main/battleUnit/usecases/commands/BattleUnitDeployer';
import { AbilityCaster } from '../../../main/battleUnit/usecases/commands/AbilityCaster';
import { InMemoryBattleUnitRepository } from '../../../main/battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { UnitCreator } from '../../../main/unit/usecases/commands/UnitCreator';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';
import { InMemoryBattlefieldRepository } from '../../../main/battlefield/adapters/storage/InMemoryBattlefieldRepository';
import { BattlefieldInitializer } from '../../../main/battlefield/usecases/commands/BattlefieldInitializer';

const battlefieldId = 'battlefield-1';

let battleUnitRepository: InMemoryBattleUnitRepository;
let unitRepository: InMemoryUnitRepository;
let playerRepository: InMemoryPlayerRepository;
let abilityRepository: InMemoryAbilityRepository;
let effectRepository: InMemoryEffectRepository;
let battlefieldRepository: InMemoryBattlefieldRepository;
let battleUnitDeployer: BattleUnitDeployer;
let abilityCaster: AbilityCaster;

let request: { casterId: string; abilityId: string; targetIds: string[] };
let error: Error | undefined;

Before(async function () {
  battleUnitRepository = new InMemoryBattleUnitRepository();
  unitRepository = new InMemoryUnitRepository();
  playerRepository = new InMemoryPlayerRepository();
  abilityRepository = new InMemoryAbilityRepository();
  effectRepository = new InMemoryEffectRepository();
  battlefieldRepository = new InMemoryBattlefieldRepository();
  await new BattlefieldInitializer(battlefieldRepository).initializeUniform(battlefieldId, 8, 8, 'plains');
  battleUnitDeployer = new BattleUnitDeployer(
    battleUnitRepository,
    unitRepository,
    playerRepository,
    battlefieldRepository,
    battlefieldId,
  );
  abilityCaster = new AbilityCaster(
    battleUnitRepository,
    abilityRepository,
    effectRepository,
    battlefieldRepository,
    battlefieldId,
    () => 0,
  );

  await new EffectCreator(effectRepository).create('damage-effect', 'DealDamage', 0, 20, 100);
  await new AbilityCreator(abilityRepository, effectRepository).create(
    'fire-bolt',
    'Fire bolt',
    10,
    2,
    ['damage-effect'],
    'AdjacentEnemy',
  );
  await new UnitCreator(unitRepository, abilityRepository).create('goblin-unit', 'Goblin', 100, 50, ['fire-bolt'], 3);
  await new UnitCreator(unitRepository, abilityRepository).create('poor-unit', 'Weakling', 100, 5, ['fire-bolt'], 3);

  await new PlayerCreator(playerRepository).create('player-one', 'human', 'Player One');
  await new PlayerCreator(playerRepository).create('player-two', 'cpu', 'Player Two');

  await battleUnitDeployer.deploy('caster-battle-unit', 'goblin-unit', 'player-one', { row: 0, col: 0 });
  await battleUnitDeployer.deploy('enemy-battle-unit', 'goblin-unit', 'player-two', { row: 0, col: 1 });
  await battleUnitDeployer.deploy('far-battle-unit', 'goblin-unit', 'player-two', { row: 5, col: 5 });

  request = { casterId: 'caster-battle-unit', abilityId: 'fire-bolt', targetIds: ['enemy-battle-unit'] };
  error = undefined;
});

Given('a caster battle unit id', function () {
  request.casterId = 'caster-battle-unit';
});

Given('a caster battle unit id that is not deployed', function () {
  request.casterId = 'missing-caster';
});

Given('an ability id', function () {
  request.abilityId = 'fire-bolt';
});

Given('an ability id that the battle unit does not have', function () {
  request.abilityId = 'unknown-ability';
});

Given('an ability id that is on cooldown', async function () {
  await abilityCaster.cast(request.casterId, 'fire-bolt', ['enemy-battle-unit']);
});

Given('a list of targeted battle unit ids', function () {
  request.targetIds = ['enemy-battle-unit'];
});

Given('all targeted battle units are deployed', function () {
  // the default targets are already deployed
});

Given('the ability target pattern allows targeting all the targeted battle units', function () {
  // the default enemy battle unit is adjacent to the caster
});

Given('the caster battle unit has enough mana', function () {
  // the caster starts with enough mana for the default ability cost
});

Given('the ability cooldown turns left is 0', function () {
  // a freshly created ability starts with no cooldown
});

Given('one targeted battle unit is not deployed', function () {
  request.targetIds = ['missing-target'];
});

Given('the ability target pattern does not allow targeting all the targeted battle units', function () {
  request.targetIds = ['far-battle-unit'];
});

Given('the caster battle unit has less mana than the ability cost', async function () {
  await battleUnitDeployer.deploy('poor-caster-battle-unit', 'poor-unit', 'player-one', { row: 3, col: 3 });
  request.casterId = 'poor-caster-battle-unit';
});

Given('a valid list of targeted battle unit ids', function () {
  request.targetIds = ['enemy-battle-unit'];
});

When('casting an ability', async function () {
  try {
    await abilityCaster.cast(request.casterId, request.abilityId, request.targetIds);
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('all the targeted battle units will be affected by each ability effects', async function () {
  assert.equal(error, undefined);
  const target = await battleUnitRepository.searchById('enemy-battle-unit');
  assert.equal(target?.toDto().remainingHealth, 80);
});

Then('the caster battle unit mana points are reduced based on the ability cost', async function () {
  const caster = await battleUnitRepository.searchById(request.casterId);
  assert.equal(caster?.remainingMana, 40);
});

Then('the caster battle unit ability cooldown turns left is incremented based on the ability cooldown', async function () {
  const caster = await battleUnitRepository.searchById(request.casterId);
  assert.equal(caster?.findAbility('fire-bolt')?.cooldownTurnsLeft, 2);
});

Then('casting the ability fails', function () {
  assert.ok(error instanceof Error);
});
