import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { type UnitDTO } from '../../../main/unit/domain';
import { UnitCreator } from '../../../main/unit/usecases/commands/UnitCreator';
import { UnitSearcher } from '../../../main/unit/usecases/queries/UnitSearcher';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';

let unitRepository: InMemoryUnitRepository;
let unitCreator: UnitCreator;
let unitSearcher: UnitSearcher;
let foundUnit: UnitDTO | null;

Before(async function () {
  unitRepository = new InMemoryUnitRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  unitCreator = new UnitCreator(unitRepository, abilityRepository);
  unitSearcher = new UnitSearcher(unitRepository);

  const effectRepository = new InMemoryEffectRepository();
  await new EffectCreator(effectRepository).create('default-effect', 'Heal', 0, 10, 100);
  await new AbilityCreator(abilityRepository, effectRepository).create(
    'default-ability',
    'Fire bolt',
    10,
    2,
    ['default-effect'],
    'AdjacentEnemy',
  );
});

Given('the unit id is {string}', async function (id: string) {
  await unitCreator.create(id, 'Goblin', 100, 50, ['default-ability'], 3);
});

When('searching the unit by id {string}', async function (id: string) {
  foundUnit = await unitSearcher.searchById(id);
});

Then('the unit will be found', function () {
  assert.notEqual(foundUnit, null);
});

Then('the unit will not be found', function () {
  assert.equal(foundUnit, null);
});
