import { useBattle } from './BattleContext';
import { ABILITY_DEFINITIONS, UNIT_NAME } from './seedDemoGame';

export function DetailsPanel() {
  const { selectedUnit, selectedAbility, effectFor } = useBattle();

  if (selectedAbility) {
    const definition = ABILITY_DEFINITIONS.find((a) => a.id === selectedAbility.id);
    const effect = effectFor(selectedAbility.effectIds[0]);
    return (
      <section className="details-panel">
        <h3>{definition?.name ?? selectedAbility.name}</h3>
        <p>{definition?.description}</p>
        <p>
          <strong>Effects</strong>
        </p>
        {effect && (
          <p>
            {effect.type === 'Heal' ? 'Heals' : 'Deals damage'}
            {effect.duration > 0 ? ` during ${effect.duration} turns` : ''}
          </p>
        )}
      </section>
    );
  }

  if (selectedUnit) {
    return (
      <section className="details-panel">
        <h3>{UNIT_NAME[selectedUnit.unitId] ?? selectedUnit.unitId}</h3>
        <p>
          <strong>Stats</strong>
        </p>
        <p>Max health {selectedUnit.maxHealth}</p>
        <p>Max mana {selectedUnit.maxMana}</p>
        <p>Movement {selectedUnit.movementRange}</p>
      </section>
    );
  }

  return <section className="details-panel" />;
}
