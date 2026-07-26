import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { getGreeting } from '../../../main/logic/greeting';

let name: string | undefined;
let result: string;

Given('no name is provided', function () {
  name = undefined;
});

Given('the name {string}', function (providedName: string) {
  name = providedName;
});

When('I request a greeting', function () {
  result = name === undefined ? getGreeting() : getGreeting(name);
});

Then('the greeting should be {string}', function (expected: string) {
  assert.equal(result, expected);
});
