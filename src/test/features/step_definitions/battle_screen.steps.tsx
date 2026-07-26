import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BattleProvider } from '../../../main/battle/adapters/presentation/BattleContext';
import { BattleScreen } from '../../../main/battle/adapters/presentation/BattleScreen';
import { seedDemoGame } from '../../../main/battle/adapters/presentation/seedDemoGame';
import { BattleUnitMover } from '../../../main/battleUnit/usecases/commands/BattleUnitMover';
import { BattleUnitTurnStarter } from '../../../main/battleUnit/usecases/commands/BattleUnitTurnStarter';
import { type BattleUnitRepository } from '../../../main/battleUnit/domain';
import { type BattlefieldRepository } from '../../../main/battlefield/domain';

// human-battle-unit-4 (a Goblin, movement range 3) starts at (6,6) in the bottom-right
// corner, far from any cpu unit. To exercise the "select ability / cast" UI flow we walk
// it next to cpu-battle-unit-4 (a Goblin at (1,1)) via three turns of real movement,
// ending adjacent at (1,2), before the screen is ever rendered.
async function relocateAllyNextToEnemy(
  battleUnitRepository: BattleUnitRepository,
  battlefieldRepository: BattlefieldRepository,
  battlefieldId: string,
) {
  const mover = new BattleUnitMover(battleUnitRepository, battlefieldRepository, battlefieldId);
  const turnStarter = new BattleUnitTurnStarter(battleUnitRepository);
  const unitId = 'human-battle-unit-4';

  await mover.move(unitId, { row: 3, col: 6 });
  await turnStarter.beginTurn(unitId);
  await mover.move(unitId, { row: 3, col: 3 });
  await turnStarter.beginTurn(unitId);
  await mover.move(unitId, { row: 1, col: 2 });
}

Given('the battle screen is displayed', async function () {
  const game = await seedDemoGame();
  await relocateAllyNextToEnemy(game.battleUnitRepository, game.battlefieldRepository, game.battlefieldId);

  render(
    <BattleProvider initialGame={game}>
      <BattleScreen />
    </BattleProvider>,
  );
  await screen.findByText(/Human turn/);
});

Then('the header shows {string}', async function (headerText: string) {
  await waitFor(() => {
    const heading = screen.getByRole('heading', { level: 1 });
    assert.equal(heading.textContent, headerText);
  });
});

Then('the ally battle unit is visible on the battlefield', function () {
  const tile = screen.getByLabelText('tile-7-7');
  assert.equal(tile.textContent, '🛡️');
});

Then('the enemy battle unit is visible on the battlefield', function () {
  const tile = screen.getByLabelText('tile-0-0');
  assert.equal(tile.textContent, '🛡️');
});

Given('I select the ally battle unit', async function () {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText('tile-7-7'));
});

Then('its movement range tiles are highlighted', function () {
  const tile = screen.getByLabelText('tile-7-5');
  assert.ok(tile.className.includes('move-range'));
});

Then('its ability icons are shown', function () {
  const abilityButton = screen.getByRole('button', { name: 'Sword slash' });
  assert.ok(abilityButton);
});

Given('I select the ally battle unit that is close to the enemy', async function () {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText('tile-1-2'));
});

Given('I select the {string} ability', async function (abilityName: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: abilityName }));
});

Then('the ability details panel shows {string}', function (abilityName: string) {
  const heading = screen.getByRole('heading', { level: 3 });
  assert.equal(heading.textContent, abilityName);
});

Then('the enemy tile is highlighted as a valid target', function () {
  const tile = screen.getByLabelText('tile-1-1');
  assert.ok(tile.className.includes('target-range'));
});

When('I target the enemy battle unit', async function () {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText('tile-1-1'));
  await screen.findByTitle('62/80 HP');
});

Then('the enemy battle unit health is reduced', async function () {
  await waitFor(() => {
    assert.ok(screen.getByTitle('62/80 HP'));
  });
});

When('I move the battle unit to an empty highlighted tile', async function () {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText('tile-7-5'));
});

Then('the ally battle unit is displayed on the new tile', async function () {
  await waitFor(() => {
    assert.equal(screen.getByLabelText('tile-7-5').textContent, '🛡️');
    assert.equal(screen.getByLabelText('tile-7-7').textContent, '');
  });
});

Given('I click {string}', async function (buttonText: string) {
  const user = userEvent.setup();
  await user.click(screen.getByText(buttonText));
});

Then('I see {string}', function (text: string) {
  assert.ok(screen.getByText(text));
});
