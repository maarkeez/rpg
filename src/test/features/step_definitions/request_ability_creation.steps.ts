import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';

let abilityRepository: InMemoryAbilityRepository;
let effectRepository: InMemoryEffectRepository;
let abilityCreator: AbilityCreator;

let request: {
  id: string;
  name: string;
  cost: number;
  cooldown: number;
  effectIds: string[];
  targetPattern: string;
};
let error: Error | undefined;

Before(async function () {
  abilityRepository = new InMemoryAbilityRepository();
  effectRepository = new InMemoryEffectRepository();
  abilityCreator = new AbilityCreator(abilityRepository, effectRepository);
  await new EffectCreator(effectRepository).create('default-effect', 'Heal', 0, 10, 100);
});

Given('a new ability', function () {
  request = {
    id: 'ability-1',
    name: 'Fire bolt',
    cost: 10,
    cooldown: 2,
    effectIds: ['default-effect'],
    targetPattern: 'AdjacentEnemy',
  };
  error = undefined;
});

Given('an existing ability', async function () {
  request = {
    id: 'ability-1',
    name: 'Fire bolt',
    cost: 10,
    cooldown: 2,
    effectIds: ['default-effect'],
    targetPattern: 'AdjacentEnemy',
  };
  error = undefined;
  await abilityCreator.create(
    request.id,
    request.name,
    request.cost,
    request.cooldown,
    request.effectIds,
    request.targetPattern,
  );
});

Given('the ability effects exist', function () {
  // effects already exist by default, this step documents the precondition
});

Given('the ability id is empty', function () {
  request.id = '';
});

Given('the ability name is empty', function () {
  request.name = '';
});

Given('the ability name is longer than 50 characters', function () {
  request.name = 'a'.repeat(51);
});

Given('the ability cost is negative', function () {
  request.cost = -1;
});

Given('the ability cost is greater than 999', function () {
  request.cost = 1000;
});

Given('the ability cooldown is negative', function () {
  request.cooldown = -1;
});

Given('the ability cooldown is greater than 99', function () {
  request.cooldown = 100;
});

Given('the ability effects are empty', function () {
  request.effectIds = [];
});

Given('the ability has more than 3 effects', function () {
  request.effectIds = ['default-effect', 'default-effect', 'default-effect', 'default-effect'];
});

Given('the ability effect does not exist', function () {
  request.effectIds = ['missing-effect'];
});

Given('the target pattern is invalid', function () {
  request.targetPattern = 'not-a-pattern';
});

Given('the target pattern is self', function () {
  request.targetPattern = 'Self';
});

Given('the target pattern is adjacent enemy', function () {
  request.targetPattern = 'AdjacentEnemy';
});

When('the ability creation is requested', async function () {
  try {
    await abilityCreator.create(
      request.id,
      request.name,
      request.cost,
      request.cooldown,
      request.effectIds,
      request.targetPattern,
    );
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('the ability will be created', async function () {
  assert.equal(error, undefined);
  const created = await abilityRepository.searchById(request.id);
  assert.notEqual(created, null);
});

Then('the ability will not be created', function () {
  assert.ok(error instanceof Error);
});

Then('the ability creation will fail', function () {
  assert.ok(error instanceof Error);
});
