import { BattleProvider } from './battle/adapters/presentation/BattleContext';
import { BattleScreen } from './battle/adapters/presentation/BattleScreen';

function App() {
  return (
    <BattleProvider>
      <BattleScreen />
    </BattleProvider>
  );
}

export default App;
