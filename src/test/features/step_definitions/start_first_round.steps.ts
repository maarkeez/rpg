import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { FirstRoundStarter } from '../../../main/battle/usecases/commands/FirstRoundStarter';
import { InMemoryBattleRepository } from '../../../main/battle/adapters/storage/InMemoryBattleRepository';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';

const battleId = 'battle-1';
let battleRepository: InMemoryBattleRepository;
let playerRepository: InMemoryPlayerRepository;
let firstRoundStarter: FirstRoundStarter;

let playerIds: string[];
let error: Error | undefined;

Before(async function () {
  battleRepository = new InMemoryBattleRepository();
  playerRepository = new InMemoryPlayerRepository();
  firstRoundStarter = new FirstRoundStarter(battleRepository, playerRepository);

  await new PlayerCreator(playerRepository).create('player-one', 'human', 'Player One');
  await new PlayerCreator(playerRepository).create('player-two', 'cpu', 'Player Two');

  playerIds = [];
  error = undefined;
});

Given('player one', function () {
  playerIds.push('player-one');
});

Given('player two', function () {
  playerIds.push('player-two');
});

Given('a none existing player', function () {
  playerIds = ['missing-player'];
});

Given('more than 2 players', async function () {
  await new PlayerCreator(playerRepository).create('player-three', 'human', 'Player Three');
  playerIds = ['player-one', 'player-two', 'player-three'];
});

When('starting first round', async function () {
  try {
    await firstRoundStarter.start(battleId, playerIds);
    error = undefined;
  } catch (e) {
    error = e as Error;
  }
});

Then('the battle turn queue was set', async function () {
  assert.equal(error, undefined);
  const battle = await battleRepository.searchById(battleId);
  assert.deepEqual(battle?.toDto().turnQueue, ['player-one', 'player-two']);
});

Then('the player one turn started', async function () {
  const battle = await battleRepository.searchById(battleId);
  assert.equal(battle?.toDto().currentPlayerTurn, 'player-one');
});

Then('the battle started', async function () {
  const battle = await battleRepository.searchById(battleId);
  assert.equal(battle?.toDto().started, true);
});

Then('the battle start will fail', function () {
  assert.ok(error instanceof Error);
});
