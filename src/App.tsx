import { getGreeting } from './logic/greeting';

function App() {
  return (
    <main>
      <h1>{getGreeting()}</h1>
    </main>
  );
}

export default App;
