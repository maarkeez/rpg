import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { InMemoryBattleRepository } from '../../../main/battle/adapters/storage/InMemoryBattleRepository';
import { InMemoryBattleUnitRepository } from '../../../main/battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { FirstRoundStarter } from '../../../main/battle/usecases/commands/FirstRoundStarter';
import { PlayerTurnFinisher } from '../../../main/battle/usecases/commands/PlayerTurnFinisher';
import { RoundStarter } from '../../../main/battle/usecases/commands/RoundStarter';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';

const battleId = 'battle-1';

let battleRepository: InMemoryBattleRepository;
let playerTurnFinisher: PlayerTurnFinisher;
let roundStarter: RoundStarter;

Before(async function () {
  battleRepository = new InMemoryBattleRepository();
  const battleUnitRepository = new InMemoryBattleUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();

  playerTurnFinisher = new PlayerTurnFinisher(battleRepository, battleUnitRepository);
  roundStarter = new RoundStarter(battleRepository, battleUnitRepository);

  await new PlayerCreator(playerRepository).create('player-one', 'human', 'Player One');
  await new PlayerCreator(playerRepository).create('player-two', 'cpu', 'Player Two');
  await new FirstRoundStarter(battleRepository, playerRepository).start(battleId, ['player-one', 'player-two']);
});

Given('a previous round', async function () {
  await playerTurnFinisher.finish(battleId); // player-one finishes, player-two becomes current
  await playerTurnFinisher.finish(battleId); // player-two finishes, the round is now finished
});

When('starting the next round', async function () {
  await roundStarter.startNextRound(battleId);
});

Then('the player turn started for the first player in the turn queue', async function () {
  const battle = await battleRepository.searchById(battleId);
  const battleDto = battle!.toDto();
  assert.equal(battleDto.currentPlayerTurn, battleDto.turnQueue[0]);
  assert.equal(battleDto.currentRound, 2);
  assert.equal(battleDto.roundFinished, false);
});
