import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { type AbilityDTO } from '../../../main/ability/domain';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { AbilitySearcher } from '../../../main/ability/usecases/queries/AbilitySearcher';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';

let abilityRepository: InMemoryAbilityRepository;
let effectRepository: InMemoryEffectRepository;
let abilityCreator: AbilityCreator;
let abilitySearcher: AbilitySearcher;
let foundAbility: AbilityDTO | null;

Before(async function () {
  abilityRepository = new InMemoryAbilityRepository();
  effectRepository = new InMemoryEffectRepository();
  abilityCreator = new AbilityCreator(abilityRepository, effectRepository);
  abilitySearcher = new AbilitySearcher(abilityRepository);
  await new EffectCreator(effectRepository).create('default-effect', 'Heal', 0, 10, 100);
});

Given('the ability id is {string}', async function (id: string) {
  await abilityCreator.create(id, 'Fire bolt', 10, 2, ['default-effect'], 'AdjacentEnemy');
});

When('searching the ability by id {string}', async function (id: string) {
  foundAbility = await abilitySearcher.searchById(id);
});

Then('the ability will be found', function () {
  assert.notEqual(foundAbility, null);
});

Then('the ability will not be found', function () {
  assert.equal(foundAbility, null);
});
