import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { BattleUnitDeployer } from '../../../main/battleUnit/usecases/commands/BattleUnitDeployer';
import { BattleUnitTurnStarter } from '../../../main/battleUnit/usecases/commands/BattleUnitTurnStarter';
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
let abilityRepository: InMemoryAbilityRepository;
let effectRepository: InMemoryEffectRepository;
let battlefieldRepository: InMemoryBattlefieldRepository;
let battleUnitTurnStarter: BattleUnitTurnStarter;

const battleUnitId = 'battle-unit-1';

Before(async function () {
  battleUnitRepository = new InMemoryBattleUnitRepository();
  const unitRepository = new InMemoryUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();
  abilityRepository = new InMemoryAbilityRepository();
  effectRepository = new InMemoryEffectRepository();
  battlefieldRepository = new InMemoryBattlefieldRepository();
  battleUnitTurnStarter = new BattleUnitTurnStarter(battleUnitRepository);

  await new BattlefieldInitializer(battlefieldRepository).initializeUniform(battlefieldId, 8, 8, 'plains');

  await new EffectCreator(effectRepository).create('heal-effect', 'Heal', 0, 5, 100);
  await new AbilityCreator(abilityRepository, effectRepository).create(
    'self-heal',
    'Meditate',
    5,
    2,
    ['heal-effect'],
    'Self',
  );
  await new EffectCreator(effectRepository).create('focus-effect', 'Heal', 0, 1, 100);
  await new AbilityCreator(abilityRepository, effectRepository).create(
    'costly-focus',
    'Focus',
    30,
    0,
    ['focus-effect'],
    'Self',
  );
  await new UnitCreator(unitRepository, abilityRepository).create(
    'default-unit',
    'Goblin',
    100,
    50,
    ['self-heal', 'costly-focus'],
    3,
  );
  await new PlayerCreator(playerRepository).create('default-player', 'human', 'Player One');

  await new BattleUnitDeployer(battleUnitRepository, unitRepository, playerRepository, battlefieldRepository, battlefieldId).deploy(
    battleUnitId,
    'default-unit',
    'default-player',
    { row: 0, col: 0 },
  );
});

Given('a battle unit', function () {
  // the battle unit is deployed in the Before hook
});

Given('the player turn has started', function () {
  // documents the precondition; turn ownership is not enforced at this isolated level
});

Given('the battle unit has an ability in cooldown', async function () {
  const abilityCaster = new AbilityCaster(
    battleUnitRepository,
    abilityRepository,
    effectRepository,
    battlefieldRepository,
    battlefieldId,
    () => 0,
  );
  await abilityCaster.cast(battleUnitId, 'self-heal', [battleUnitId]);
});

Given('the battle unit has spent some mana', async function () {
  const abilityCaster = new AbilityCaster(
    battleUnitRepository,
    abilityRepository,
    effectRepository,
    battlefieldRepository,
    battlefieldId,
    () => 0,
  );
  await abilityCaster.cast(battleUnitId, 'costly-focus', [battleUnitId]);
});

When('the battle unit turn begins', async function () {
  await battleUnitTurnStarter.beginTurn(battleUnitId);
});

Then('the ability cooldown turns left will be reduced by one', async function () {
  const battleUnit = await battleUnitRepository.searchById(battleUnitId);
  const ability = battleUnit?.findAbility('self-heal');
  assert.equal(ability?.cooldownTurnsLeft, 1);
});

Then('the battle unit movement remaining steps will be reset to the unit movement range', async function () {
  const battleUnit = await battleUnitRepository.searchById(battleUnitId);
  assert.equal(battleUnit?.toDto().remainingMoveSteps, 3);
});

Then('the cast ability turn action will be available', async function () {
  const battleUnit = await battleUnitRepository.searchById(battleUnitId);
  assert.equal(battleUnit?.toDto().canCastAbility, true);
});

Then(
  'the battle unit remaining mana points will be increased by 10 percent of the unit maximum mana without exceeding the unit maximum',
  async function () {
    const battleUnit = await battleUnitRepository.searchById(battleUnitId);
    // maxMana=50, costly-focus costs 30 leaving 20, beginTurn adds round(50*0.1)=5
    assert.equal(battleUnit?.toDto().remainingMana, 25);
  },
);
