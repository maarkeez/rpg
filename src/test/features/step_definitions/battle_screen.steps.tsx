import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BattleProvider } from '../../../main/battle/adapters/presentation/BattleContext';
import { BattleScreen } from '../../../main/battle/adapters/presentation/BattleScreen';

Given('the battle screen is displayed', async function () {
  render(
    <BattleProvider>
      <BattleScreen />
    </BattleProvider>,
  );
  await screen.findByText(/Player one turn/);
});

Then('the header shows {string}', function (headerText: string) {
  const heading = screen.getByRole('heading', { level: 1 });
  assert.equal(heading.textContent, headerText);
});

Then('the ally battle unit is visible on the battlefield', function () {
  const tile = screen.getByLabelText('tile-6-3');
  assert.equal(tile.textContent, '👹');
});

Then('the enemy battle unit is visible on the battlefield', function () {
  const tile = screen.getByLabelText('tile-5-3');
  assert.equal(tile.textContent, '👹');
});

Given('I select the ally battle unit', async function () {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText('tile-6-3'));
});

Then('its movement range tiles are highlighted', function () {
  const tile = screen.getByLabelText('tile-6-0');
  assert.ok(tile.className.includes('move-range'));
});

Then('its ability icons are shown', function () {
  const abilityButton = screen.getByRole('button', { name: 'Fire bolt' });
  assert.ok(abilityButton);
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
  const tile = screen.getByLabelText('tile-5-3');
  assert.ok(tile.className.includes('target-range'));
});

When('I target the enemy battle unit', async function () {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText('tile-5-3'));
  await screen.findByTitle('80/100 HP');
});

Then('the enemy battle unit health is reduced', function () {
  assert.ok(screen.getByTitle('80/100 HP'));
});

When('I move the battle unit to an empty highlighted tile', async function () {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText('tile-6-0'));
  await screen.findByLabelText('tile-6-0');
});

Then('the ally battle unit is displayed on the new tile', function () {
  const tile = screen.getByLabelText('tile-6-0');
  assert.equal(tile.textContent, '👹');
  const oldTile = screen.getByLabelText('tile-6-3');
  assert.equal(oldTile.textContent, '');
});

Given('I click {string}', async function (buttonText: string) {
  const user = userEvent.setup();
  await user.click(screen.getByText(buttonText));
});

Then('I see {string}', function (text: string) {
  assert.ok(screen.getByText(text));
});
