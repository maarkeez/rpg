import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { InMemoryBattleRepository } from '../../../main/battle/adapters/storage/InMemoryBattleRepository';
import { FirstRoundStarter } from '../../../main/battle/usecases/commands/FirstRoundStarter';
import { PlayerTurnFinisher } from '../../../main/battle/usecases/commands/PlayerTurnFinisher';
import { InMemoryBattleUnitRepository } from '../../../main/battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { BattleUnitDeployer } from '../../../main/battleUnit/usecases/commands/BattleUnitDeployer';
import { PlayerCreator } from '../../../main/player/usecases/commands/PlayerCreator';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';
import { UnitCreator } from '../../../main/unit/usecases/commands/UnitCreator';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { AbilityCreator } from '../../../main/ability/usecases/commands/AbilityCreator';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { EffectCreator } from '../../../main/effect/usecases/commands/EffectCreator';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';
import { InMemoryBattlefieldRepository } from '../../../main/battlefield/adapters/storage/InMemoryBattlefieldRepository';
import { BattlefieldInitializer } from '../../../main/battlefield/usecases/commands/BattlefieldInitializer';
import { CpuTurnPlayer } from '../../../main/cpuBrain/usecases/commands/CpuTurnPlayer';

const battleId = 'battle-1';
const battlefieldId = 'battlefield-1';

let battleRepository: InMemoryBattleRepository;
let battleUnitRepository: InMemoryBattleUnitRepository;
let playerTurnFinisher: PlayerTurnFinisher;
let cpuTurnPlayer: CpuTurnPlayer;

Before(async function () {
  battleRepository = new InMemoryBattleRepository();
  battleUnitRepository = new InMemoryBattleUnitRepository();
  const playerRepository = new InMemoryPlayerRepository();
  const unitRepository = new InMemoryUnitRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const effectRepository = new InMemoryEffectRepository();
  const battlefieldRepository = new InMemoryBattlefieldRepository();

  playerTurnFinisher = new PlayerTurnFinisher(battleRepository, battleUnitRepository);
  cpuTurnPlayer = new CpuTurnPlayer(
    battleRepository,
    playerRepository,
    battleUnitRepository,
    abilityRepository,
    effectRepository,
    battlefieldRepository,
    battlefieldId,
  );

  await new BattlefieldInitializer(battlefieldRepository).initializeUniform(battlefieldId, 8, 8, 'plains');

  await new PlayerCreator(playerRepository).create('player-one', 'human', 'Player One');
  await new PlayerCreator(playerRepository).create('player-two', 'cpu', 'Player Two');
  await new FirstRoundStarter(battleRepository, playerRepository).start(battleId, ['player-one', 'player-two']);

  await new EffectCreator(effectRepository).create('damage-effect', 'DealDamage', 0, 20, 100);
  await new AbilityCreator(abilityRepository, effectRepository).create(
    'fire-bolt',
    'Fire bolt',
    10,
    2,
    ['damage-effect'],
    'AdjacentEnemy',
  );
  await new UnitCreator(unitRepository, abilityRepository).create('goblin-unit', 'Goblin', 100, 50, ['fire-bolt'], 3);

  const battleUnitDeployer = new BattleUnitDeployer(
    battleUnitRepository,
    unitRepository,
    playerRepository,
    battlefieldRepository,
    battlefieldId,
  );
  await battleUnitDeployer.deploy('cpu-battle-unit', 'goblin-unit', 'player-two', { row: 0, col: 0 });
  await battleUnitDeployer.deploy('human-battle-unit', 'goblin-unit', 'player-one', { row: 0, col: 4 });
});

Given('a player turn started', function () {
  // the battle already started with player-one's turn active
});

Given('a the player is human', function () {
  // player-one, the current turn holder, is human
});

Given('a the player is cpu', async function () {
  await playerTurnFinisher.finish(battleId); // hands the active turn to player-two, the cpu
});

When('playing the cpu turn', async function () {
  await cpuTurnPlayer.play(battleId);
});

Then('will do nothing', async function () {
  const battle = await battleRepository.searchById(battleId);
  assert.equal(battle?.toDto().currentPlayerTurn, 'player-one');
  assert.equal(battle?.toDto().currentRound, 1);
  const cpuUnit = await battleUnitRepository.searchById('cpu-battle-unit');
  assert.deepEqual(cpuUnit?.position, { row: 0, col: 0 });
});

Then(
  'each battle unit for the cpu player will be moved towards their closest enemy if the battle unit has remaining steps',
  async function () {
    const cpuUnit = await battleUnitRepository.searchById('cpu-battle-unit');
    assert.deepEqual(cpuUnit?.position, { row: 0, col: 3 });
  },
);

Then(
  'each battle unit for the cpu player will cast the highest power ability that is not in cooldown if the target is in range',
  async function () {
    const humanUnit = await battleUnitRepository.searchById('human-battle-unit');
    assert.equal(humanUnit?.toDto().remainingHealth, 80);
  },
);

Then('the cpu player will finish the turn', async function () {
  const battle = await battleRepository.searchById(battleId);
  assert.equal(battle?.toDto().currentPlayerTurn, 'player-one');
  assert.equal(battle?.toDto().currentRound, 2);
});
