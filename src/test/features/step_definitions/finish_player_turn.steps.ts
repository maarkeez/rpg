import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { InMemoryBattleRepository } from '../../../main/battle/adapters/storage/InMemoryBattleRepository';
import { InMemoryBattleUnitRepository } from '../../../main/battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { FirstRoundStarter } from '../../../main/battle/usecases/commands/FirstRoundStarter';
import { PlayerTurnFinisher } from '../../../main/battle/usecases/commands/PlayerTurnFinisher';
import { PlayerDefeater } from '../../../main/battle/usecases/commands/PlayerDefeater';
import { AbilityEffectReceiver } from '../../../main/battleUnit/usecases/commands/AbilityEffectReceiver';
import { BattleUnitDeployer } from '../../../main/battleUnit/usecases/commands/BattleUnitDeployer';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';
import { UnitCreator } from '../../../main/unit/usecases/commands/UnitCreator';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';
import { EffectType } from '../../../main/effect/domain';
import { InMemoryBattlefieldRepository } from '../../../main/battlefield/adapters/storage/InMemoryBattlefieldRepository';
import { BattlefieldInitializer } from '../../../main/battlefield/usecases/commands/BattlefieldInitializer';

const battleId = 'battle-1';
const battlefieldId = 'battlefield-1';

let battleRepository: InMemoryBattleRepository;
let battleUnitRepository: InMemoryBattleUnitRepository;
let playerTurnFinisher: PlayerTurnFinisher;
let playerDefeater: PlayerDefeater;
let effectReceiver: AbilityEffectReceiver;

Before(async function () {
  battleRepository = new InMemoryBattleRepository();
  battleUnitRepository = new InMemoryBattleUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();
  const unitRepository = new InMemoryUnitRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const effectRepository = new InMemoryEffectRepository();
  const battlefieldRepository = new InMemoryBattlefieldRepository();
  await new BattlefieldInitializer(battlefieldRepository).initializeUniform(battlefieldId, 8, 8, 'plains');

  playerTurnFinisher = new PlayerTurnFinisher(battleRepository, battleUnitRepository);
  playerDefeater = new PlayerDefeater(battleRepository, battleUnitRepository);
  effectReceiver = new AbilityEffectReceiver(battleUnitRepository);

  await new PlayerCreator(playerRepository).create('player-one', 'human', 'Player One');
  await new PlayerCreator(playerRepository).create('player-two', 'cpu', 'Player Two');
  await new FirstRoundStarter(battleRepository, playerRepository).start(battleId, ['player-one', 'player-two']);

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

  const battleUnitDeployer = new BattleUnitDeployer(
    battleUnitRepository,
    unitRepository,
    playerRepository,
    battlefieldRepository,
    battlefieldId,
  );
  await battleUnitDeployer.deploy('player-one-unit', 'default-unit', 'player-one', { row: 0, col: 0 });
  await battleUnitDeployer.deploy('player-two-unit', 'default-unit', 'player-two', { row: 0, col: 1 });
});

Given('a player', function () {
  // player-one holds the current turn by default, per the Before hook
});

Given('there are more players in the turn queue', function () {
  // the turn queue starts as [player-one, player-two]
});

Given('is the last player on the turn queue', async function () {
  await playerTurnFinisher.finish(battleId);
});

When('finishing player turn', async function () {
  await playerTurnFinisher.finish(battleId);
});

When('the current player is defeated', async function () {
  const battle = await battleRepository.searchById(battleId);
  const currentPlayerId = battle!.toDto().currentPlayerTurn;
  const battleUnits = await battleUnitRepository.searchByPlayerId(currentPlayerId);
  for (const battleUnit of battleUnits) {
    await effectReceiver.receive(battleUnit.id, EffectType.DealDamage, battleUnit.toDto().maxHealth);
  }
  await playerDefeater.defeat(battleId, currentPlayerId);
});

Then('the turn for the next player in the queue will be started', async function () {
  const battle = await battleRepository.searchById(battleId);
  assert.equal(battle?.toDto().currentPlayerTurn, 'player-two');
});

Then('the round finished', async function () {
  const battle = await battleRepository.searchById(battleId);
  assert.equal(battle?.toDto().roundFinished, true);
});
