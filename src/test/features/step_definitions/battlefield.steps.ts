import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { InMemoryBattlefieldRepository } from '../../../main/battlefield/adapters/storage/InMemoryBattlefieldRepository';
import { BattlefieldInitializer } from '../../../main/battlefield/usecases/commands/BattlefieldInitializer';
import { BattlefieldOccupancyUpdater } from '../../../main/battlefield/usecases/commands/BattlefieldOccupancyUpdater';
import { BattleUnitBattlefieldRemover } from '../../../main/battlefield/usecases/commands/BattleUnitBattlefieldRemover';
import { type TileInit } from '../../../main/battlefield/domain';
import { type Position } from '../../../main/battleUnit/domain';

const battlefieldId = 'battlefield-1';
const battleUnitId = 'unit-1';

let battlefieldRepository: InMemoryBattlefieldRepository;
let battlefieldInitializer: BattlefieldInitializer;
let occupancyUpdater: BattlefieldOccupancyUpdater;
let battleUnitBattlefieldRemover: BattleUnitBattlefieldRemover;

let rows: number;
let cols: number;
let tiles: TileInit[];
let formerPosition: Position;
let currentPosition: Position;
let pendingOccupancyAction: 'occupy' | 'move' | null;

Before(function () {
  battlefieldRepository = new InMemoryBattlefieldRepository();
  battlefieldInitializer = new BattlefieldInitializer(battlefieldRepository);
  occupancyUpdater = new BattlefieldOccupancyUpdater(battlefieldRepository);
  battleUnitBattlefieldRemover = new BattleUnitBattlefieldRemover(battlefieldRepository);

  rows = 8;
  cols = 8;
  tiles = [];
  formerPosition = { row: 0, col: 0 };
  currentPosition = { row: 0, col: 0 };
  pendingOccupancyAction = null;
});

// --- Initialize battlefield ---

Given('a number of rows', function () {
  rows = 8;
});

Given('a number of columns', function () {
  cols = 6;
});

Given('a list of tiles', function () {
  tiles = [
    { position: { row: 0, col: 0 }, terrainId: 'plains' },
    { position: { row: 0, col: 1 }, terrainId: 'forest' },
  ];
});

When('initializing the battlefield', async function () {
  await battlefieldInitializer.initialize(battlefieldId, rows, cols, tiles);
});

Then('the battlefield will be initialized with the given rows', async function () {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  assert.equal(battlefield?.toDto().rows, rows);
});

Then('the battlefield will be initialized with the given columns', async function () {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  assert.equal(battlefield?.toDto().cols, cols);
});

Then('the battlefield tiles will be initialized in each position', async function () {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  const dtoTiles = battlefield!.toDto().tiles;
  for (const tile of tiles) {
    assert.ok(dtoTiles.some((t) => t.position.row === tile.position.row && t.position.col === tile.position.col));
  }
});

Then('all of them will be vacant', async function () {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  assert.ok(battlefield!.toDto().tiles.every((tile) => tile.occupyingBattleUnitId === null));
});

Then('the terrain will be initialized with the given tile terrain', async function () {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  const dtoTiles = battlefield!.toDto().tiles;
  for (const tile of tiles) {
    const dtoTile = dtoTiles.find((t) => t.position.row === tile.position.row && t.position.col === tile.position.col);
    assert.equal(dtoTile?.terrainId, tile.terrainId);
  }
});

// --- Remove battle unit from battlefield / Update battlefield occupancy ---

Given('an initialized battlefield', async function () {
  await battlefieldInitializer.initializeUniform(battlefieldId, rows, cols, 'plains');
});

Given('a battle unit was deployed', function () {
  currentPosition = { row: 2, col: 3 };
  pendingOccupancyAction = 'occupy';
});

Given('the battle unit was defeated', async function () {
  await battlefieldInitializer.initializeUniform(battlefieldId, rows, cols, 'plains');
  formerPosition = { row: 4, col: 4 };
  await occupancyUpdater.occupy(battlefieldId, formerPosition, battleUnitId);
});

Given('a the battle unit is occupying a tile', async function () {
  await battlefieldInitializer.initializeUniform(battlefieldId, rows, cols, 'plains');
  formerPosition = { row: 1, col: 1 };
  await occupancyUpdater.occupy(battlefieldId, formerPosition, battleUnitId);
});

Given('the battle unit was moved', function () {
  currentPosition = { row: 1, col: 2 };
  pendingOccupancyAction = 'move';
});

When('removing the battle unit from the battlefield', async function () {
  await battleUnitBattlefieldRemover.remove(battlefieldId, formerPosition);
});

When('updating the battlefield occupancy', async function () {
  if (pendingOccupancyAction === 'occupy') {
    await occupancyUpdater.occupy(battlefieldId, currentPosition, battleUnitId);
  } else if (pendingOccupancyAction === 'move') {
    await occupancyUpdater.move(battlefieldId, formerPosition, currentPosition, battleUnitId);
  }
});

Then('the tile in the former position will be vacant', async function () {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  assert.ok(battlefield!.isVacant(formerPosition));
});

Then('the tile in the deployed position will be occupied', async function () {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  assert.ok(!battlefield!.isVacant(currentPosition));
});

Then('the tile in the new position will be occupied', async function () {
  const battlefield = await battlefieldRepository.searchById(battlefieldId);
  assert.ok(!battlefield!.isVacant(currentPosition));
});
