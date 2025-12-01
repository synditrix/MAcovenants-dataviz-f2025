import './App.css';
import { StatsOverview } from './components/StatsOverview';
import { Header } from './components/Header';

function App() {
    return (
        <div style={{ padding: '1.5rem' }}>
            <Header />
            <StatsOverview />
            {/* later: Recharts components  */}
        </div>
    );
}

export default App;
