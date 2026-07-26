import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';

let effectRepository: InMemoryEffectRepository;
let effectCreator: EffectCreator;
let request: { id: string; type: string; duration: number; power: number; probability: number };
let error: Error | undefined;

Before(function () {
  effectRepository = new InMemoryEffectRepository();
  effectCreator = new EffectCreator(effectRepository);
});

Given('a new effect', function () {
  request = { id: 'effect-1', type: 'Heal', duration: 0, power: 10, probability: 100 };
  error = undefined;
});

Given('an existing effect', async function () {
  request = { id: 'effect-1', type: 'Heal', duration: 0, power: 10, probability: 100 };
  error = undefined;
  await effectCreator.create(
    request.id,
    request.type,
    request.duration,
    request.power,
    request.probability,
  );
});

Given('the effect id is empty', function () {
  request.id = '';
});

Given('the effect type is heal', function () {
  request.type = 'Heal';
});

Given('the effect type is fire', function () {
  request.type = 'DealDamage';
});

Given('the effect type is invalid', function () {
  request.type = 'not-a-type';
});

Given('the effect duration is negative', function () {
  request.duration = -1;
});

Given('the effect duration is greater than 99', function () {
  request.duration = 100;
});

Given('the effect power is less than 0', function () {
  request.power = -1;
});

Given('the effect power is greater than 999', function () {
  request.power = 1000;
});

Given('the effect probability is less than 0', function () {
  request.probability = -1;
});

Given('the effect probability is greater than 100', function () {
  request.probability = 101;
});

When('the effect creation is requested', async function () {
  try {
    await effectCreator.create(
      request.id,
      request.type,
      request.duration,
      request.power,
      request.probability,
    );
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('the effect will be created', async function () {
  assert.equal(error, undefined);
  const created = await effectRepository.searchById(request.id);
  assert.notEqual(created, null);
});

Then('the effect will not be created', function () {
  assert.ok(error instanceof Error);
});

Then('the effect creation will fail', function () {
  assert.ok(error instanceof Error);
});

Then('the effect creation will be created', function () {
  assert.equal(error, undefined);
});
