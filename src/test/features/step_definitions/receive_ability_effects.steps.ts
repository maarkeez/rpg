import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { BattleUnitDeployer } from '../../../main/battleUnit/usecases/commands/BattleUnitDeployer';
import { AbilityEffectReceiver } from '../../../main/battleUnit/usecases/commands/AbilityEffectReceiver';
import { InMemoryBattleUnitRepository } from '../../../main/battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { UnitCreator } from '../../../main/unit/usecases/commands/UnitCreator';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';
import { EffectType } from '../../../main/effect/domain';

let battleUnitRepository: InMemoryBattleUnitRepository;
let effectReceiver: AbilityEffectReceiver;

const targetId = 'target-battle-unit';
let effectType: EffectType;
let power: number;
let healthBefore: number;

Before(async function () {
  battleUnitRepository = new InMemoryBattleUnitRepository();
  const unitRepository = new InMemoryUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const effectRepository = new InMemoryEffectRepository();
  effectReceiver = new AbilityEffectReceiver(battleUnitRepository);

  await new EffectCreator(effectRepository).create('default-effect', 'Heal', 0, 10, 100);
  await new AbilityCreator(abilityRepository, effectRepository).create(
    'default-ability',
    'Fire bolt',
    10,
    2,
    ['default-effect'],
    'AdjacentEnemy',
  );
  await new UnitCreator(unitRepository, abilityRepository).create(
    'default-unit',
    'Goblin',
    100,
    50,
    ['default-ability'],
    3,
  );
  await new PlayerCreator(playerRepository).create('default-player', 'human', 'Player One');

  await new BattleUnitDeployer(battleUnitRepository, unitRepository, playerRepository).deploy(
    targetId,
    'default-unit',
    'default-player',
    { row: 0, col: 0 },
  );
});

Given('an ability casted by a battle unit', function () {
  // the target battle unit is deployed in the Before hook
});

Given('the casted ability heals', async function () {
  await effectReceiver.receive(targetId, EffectType.DealDamage, 40);
  const target = await battleUnitRepository.searchById(targetId);
  healthBefore = target!.toDto().remainingHealth;
  effectType = EffectType.Heal;
  power = 20;
});

Given('the casted ability deals damage', async function () {
  const target = await battleUnitRepository.searchById(targetId);
  healthBefore = target!.toDto().remainingHealth;
  effectType = EffectType.DealDamage;
  power = 100;
});

When('a target battle unit receives the ability effects', async function () {
  await effectReceiver.receive(targetId, effectType, power);
});

Then('the target battle unit health will be increased based on the ability effect power', async function () {
  const target = await battleUnitRepository.searchById(targetId);
  assert.equal(target?.toDto().remainingHealth, healthBefore + power);
});

Then('the target battle unit health will be decreased based on the ability effect power', async function () {
  const target = await battleUnitRepository.searchById(targetId);
  assert.equal(target?.toDto().remainingHealth, Math.max(0, healthBefore - power));
});

Then('the target battle unit will be defeated if the health reached zero', async function () {
  const target = await battleUnitRepository.searchById(targetId);
  assert.equal(target?.toDto().isDefeated, target?.toDto().remainingHealth === 0);
});
