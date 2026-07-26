import './battle.css';
import { useBattle } from './BattleContext';
import { BattlefieldGrid } from './BattlefieldGrid';
import { UnitPanel } from './UnitPanel';
import { DetailsPanel } from './DetailsPanel';
import { FinishTurnControl } from './FinishTurnControl';

const PLAYER_LABEL: Record<string, string> = {
  'human-player': 'Human',
  'cpu-player': 'CPU',
};

export function BattleScreen() {
  const { isReady, battle, lastActionError } = useBattle();

  if (!isReady || !battle) {
    return <p>Loading battle...</p>;
  }

  return (
    <div className="battle-screen">
      <h1 className="battle-header">
        {PLAYER_LABEL[battle.currentPlayerTurn] ?? battle.currentPlayerTurn} turn - Round {battle.currentRound}
      </h1>
      <BattlefieldGrid />
      {lastActionError && <p className="action-error">{lastActionError}</p>}
      <div className="bottom-panels">
        <UnitPanel />
        <DetailsPanel />
      </div>
      <FinishTurnControl />
    </div>
  );
}
