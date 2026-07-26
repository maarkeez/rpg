import { useBattle } from './BattleContext';

export function FinishTurnControl() {
  const { isConfirmingFinishTurn, requestFinishTurn, cancelFinishTurn, confirmFinishTurn } = useBattle();

  if (isConfirmingFinishTurn) {
    return (
      <div className="finish-turn-confirmation">
        <button type="button" className="not-done-button" onClick={cancelFinishTurn}>
          I am not done yet
        </button>
        <button type="button" className="confirm-finish-button" onClick={() => void confirmFinishTurn()}>
          Confirm I finished
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="finish-turn-button" onClick={requestFinishTurn}>
      Finish my turn
    </button>
  );
}
