import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { type PlayerDTO } from '../../../main/player/domain';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { PlayerSearcher } from '../../../main/player/usecases/queries/PlayerSearcher';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';

let playerRepository: InMemoryPlayerRepository;
let playerCreator: PlayerCreator;
let playerSearcher: PlayerSearcher;
let foundPlayer: PlayerDTO | null;

Before(function () {
  playerRepository = new InMemoryPlayerRepository();
  playerCreator = new PlayerCreator(playerRepository);
  playerSearcher = new PlayerSearcher(playerRepository);
});

Given('the player id is {string}', async function (id: string) {
  await playerCreator.create(id, 'human', 'Player One');
});

When('searching the player by id {string}', async function (id: string) {
  foundPlayer = await playerSearcher.searchById(id);
});

Then('the player will be found', function () {
  assert.notEqual(foundPlayer, null);
});

Then('the player will not be found', function () {
  assert.equal(foundPlayer, null);
});
