import './App.css';
import { StatsOverview } from './components/StatsOverview';

function App() {
    return (
        <div style={{ padding: '1.5rem' }}>
            <header> Overview </header>
            <StatsOverview />
            {/* later: Recharts components  */}
        </div>
    );
}

export default App;
