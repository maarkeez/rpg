import { Before, Given, Then, When, type DataTable } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { InMemoryBattleRepository } from '../../../main/battle/adapters/storage/InMemoryBattleRepository';
import { InMemoryPlayerRepository } from '../../../main/player/adapters/storage/InMemoryPlayerRepository';
import { InMemoryUnitRepository } from '../../../main/unit/adapters/storage/InMemoryUnitRepository';
import { InMemoryAbilityRepository } from '../../../main/ability/adapters/storage/InMemoryAbilityRepository';
import { InMemoryEffectRepository } from '../../../main/effect/adapters/storage/InMemoryEffectRepository';
import { InMemoryBattleUnitRepository } from '../../../main/battleUnit/adapters/storage/InMemoryBattleUnitRepository';
import { InMemoryBattlefieldRepository } from '../../../main/battlefield/adapters/storage/InMemoryBattlefieldRepository';
import { BattleInitializer } from '../../../main/battleSetup/usecases/commands/BattleInitializer';

const battleId = 'battle-1';
const battlefieldId = 'battlefield-1';
const humanPlayerId = 'human-player';
const cpuPlayerId = 'cpu-player';

let battleRepository: InMemoryBattleRepository;
let battleUnitRepository: InMemoryBattleUnitRepository;
let battlefieldRepository: InMemoryBattlefieldRepository;
let battleInitializer: BattleInitializer;

let rows: number;
let cols: number;
let terrainId: string;

Before(function () {
  battleRepository = new InMemoryBattleRepository();
  const playerRepository = new InMemoryPlayerRepository();
  const unitRepository = new InMemoryUnitRepository();
  const abilityRepository = new InMemoryAbilityRepository();
  const effectRepository = new InMemoryEffectRepository();
  battleUnitRepository = new InMemoryBattleUnitRepository();
  battlefieldRepository = new InMemoryBattlefieldRepository();

  battleInitializer = new BattleInitializer(
    battleRepository,
    playerRepository,
    unitRepository,
    abilityRepository,
    effectRepository,
    battleUnitRepository,
    battlefieldRepository,
  );

  rows = 8;
  cols = 8;
  terrainId = 'Grass';
});

Given('the default battle setup', function (dataTable: DataTable) {
  const setup = dataTable.rowsHash();
  rows = Number(setup['Battlefield rows']);
  cols = Number(setup['Battlefield columns']);
  terrainId = setup['Default terrain'];
  // "Human units"/"CPU units" (1 Knight, 3 Goblins) document the fixed squad composition
});

Given('a new battle', function () {
  // identifiers are fixed for this scenario; nothing to prepare beforehand
});

When('the battle is initialized', async function () {
  await battleInitializer.initialize({ battleId, battlefieldId, humanPlayerId, cpuPlayerId, rows, cols, terrainId });
});

Then('the battlefield should contain {int} rows and {int} columns', async function (expectedRows: number, expectedCols: number) {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  const dto = battlefield!.toDto();
  assert.equal(dto.rows, expectedRows);
  assert.equal(dto.cols, expectedCols);
});

Then('every tile should have {string} terrain', async function (expectedTerrainId: string) {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  assert.ok(battlefield!.toDto().tiles.every((tile) => tile.terrainId === expectedTerrainId));
});

Then('the Human player should have {int} battle units', async function (count: number) {
  const battleUnits = await battleUnitRepository.searchByPlayerId(humanPlayerId);
  assert.equal(battleUnits.length, count);
});

Then('the CPU player should have {int} battle units', async function (count: number) {
  const battleUnits = await battleUnitRepository.searchByPlayerId(cpuPlayerId);
  assert.equal(battleUnits.length, count);
});

Then('the Human battle units should be deployed in the bottom-right corner', async function () {
  const battleUnits = await battleUnitRepository.searchByPlayerId(humanPlayerId);
  assert.ok(battleUnits.length > 0);
  for (const battleUnit of battleUnits) {
    assert.ok(battleUnit.position.row >= rows - 2);
    assert.ok(battleUnit.position.col >= cols - 2);
  }
});

Then('the CPU battle units should be deployed in the top-left corner', async function () {
  const battleUnits = await battleUnitRepository.searchByPlayerId(cpuPlayerId);
  assert.ok(battleUnits.length > 0);
  for (const battleUnit of battleUnits) {
    assert.ok(battleUnit.position.row < 2);
    assert.ok(battleUnit.position.col < 2);
  }
});

Then('no two battle units should occupy the same tile', async function () {
  const battleUnits = await battleUnitRepository.searchAll();
  const positions = battleUnits.map((battleUnit) => `${battleUnit.position.row},${battleUnit.position.col}`);
  assert.equal(new Set(positions).size, positions.length);
});

Then('the first battle turn should be for the Human player', async function () {
  const battle = await battleRepository.searchById(battleId);
  assert.equal(battle?.toDto().currentPlayerTurn, humanPlayerId);
});
