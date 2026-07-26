import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';

let playerRepository: InMemoryPlayerRepository;
let playerCreator: PlayerCreator;

let request: { id: string; type: string; name: string };
let error: Error | undefined;

Before(function () {
  playerRepository = new InMemoryPlayerRepository();
  playerCreator = new PlayerCreator(playerRepository);
});

Given('a new player', function () {
  request = { id: 'player-1', type: 'human', name: 'Player One' };
  error = undefined;
});

Given('an existing player', async function () {
  request = { id: 'player-1', type: 'human', name: 'Player One' };
  error = undefined;
  await playerCreator.create(request.id, request.type, request.name);
});

Given('the type is {string}', function (type: string) {
  request.type = type;
});

Given('the player id is empty', function () {
  request.id = '';
});

Given('the player name is empty', function () {
  request.name = '';
});

Given('the player name is longer than 50 characters', function () {
  request.name = 'a'.repeat(51);
});

When('the player creation is requested', async function () {
  try {
    await playerCreator.create(request.id, request.type, request.name);
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('the player will be created', async function () {
  assert.equal(error, undefined);
  const created = await playerRepository.searchById(request.id);
  assert.notEqual(created, null);
});

Then('the unit player not be created', function () {
  assert.ok(error instanceof Error);
});

Then('the player creation will fail', function () {
  assert.ok(error instanceof Error);
});
