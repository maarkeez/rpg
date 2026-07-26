import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { type EffectDTO } from '../../../main/effect/domain';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { EffectSearcher } from '../../../main/effect/usecases/queries/EffectSearcher';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';

let effectRepository: InMemoryEffectRepository;
let effectCreator: EffectCreator;
let effectSearcher: EffectSearcher;
let foundEffect: EffectDTO | null;

Before(function () {
  effectRepository = new InMemoryEffectRepository();
  effectCreator = new EffectCreator(effectRepository);
  effectSearcher = new EffectSearcher(effectRepository);
});

Given('the effect id is {string}', async function (id: string) {
  await effectCreator.create(id, 'Heal', 0, 10, 100);
});

When('searching the effect by id {string}', async function (id: string) {
  foundEffect = await effectSearcher.searchById(id);
});

Then('the effect will be found', function () {
  assert.notEqual(foundEffect, null);
});

Then('the effect will not be found', function () {
  assert.equal(foundEffect, null);
});
