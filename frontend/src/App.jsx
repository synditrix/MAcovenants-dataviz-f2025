import './App.css';
import { StatsOverview } from './components/StatsOverview';
import { Header } from './components/Header';
import TopGrantors from "./components/TopGrantors.jsx";
import TopExclusionTypes from "./components/TopExclusionTypes.jsx";
import ExclusionTypeByYear from "./components/ExclusionTypeByYear.jsx";

function App() {
    return (
        <div style={{ padding: '1.5rem' }}>
            <Header />
            <StatsOverview />
            <TopGrantors />
            <TopExclusionTypes />
            <div style={{ padding: '1.5rem', background: '#111827', minHeight: '100vh' }}>
                <ExclusionTypeByYear />
            </div>
        </div>
    );
}

export default App;
