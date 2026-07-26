import { useBattle } from './BattleContext';
import { ABILITY_DEFINITIONS, UNIT_EMOJI } from './seedDemoGame';

export function UnitPanel() {
  const { selectedUnit, selectedAbilityId, selectAbility } = useBattle();

  if (!selectedUnit) {
    return (
      <section className="unit-panel">
        <p>Select a battle unit to see its details.</p>
      </section>
    );
  }

  const healthPercent = Math.round((selectedUnit.remainingHealth / selectedUnit.maxHealth) * 100);
  const manaPercent = Math.round((selectedUnit.remainingMana / selectedUnit.maxMana) * 100);

  return (
    <section className="unit-panel">
      <div className="unit-portrait">{UNIT_EMOJI[selectedUnit.unitId] ?? '🧍'}</div>
      <p className="unit-name">Goblin</p>
      <div className="unit-stats">
        <span>{healthPercent}% ❤️</span>
        <span>{manaPercent}% 🔋</span>
        <span>
          {selectedUnit.remainingMoveSteps} 👣
        </span>
      </div>
      <div className="ability-row">
        {selectedUnit.abilities.map((unitAbility) => {
          const definition = ABILITY_DEFINITIONS.find((a) => a.id === unitAbility.abilityId);
          const isOnCooldown = unitAbility.cooldownTurnsLeft > 0;
          return (
            <button
              key={unitAbility.abilityId}
              type="button"
              className={`ability-icon${selectedAbilityId === unitAbility.abilityId ? ' selected' : ''}`}
              disabled={isOnCooldown || !selectedUnit.canCastAbility}
              aria-label={definition?.name ?? unitAbility.abilityId}
              onClick={() => selectAbility(unitAbility.abilityId)}
            >
              {definition?.emoji ?? '❓'}
            </button>
          );
        })}
      </div>
    </section>
  );
}
