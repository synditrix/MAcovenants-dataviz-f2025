import { useEffect, useMemo, useState} from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import FilterModal from './FilterModal';
import {DISTINCT_COLORS} from '../utils.js'

function ExclusionTypeByYear() {
    const [allTypes, setAllTypes] = useState([]);        // [{id, title}]
    const [selectedTypeIds, setSelectedTypeIds] = useState([]); // strings
    const [yearRange, setYearRange] = useState({ start: 1800, end: 1970 });

    const [rows, setRows] = useState([]); // raw time-series rows from API
    const [loading, setLoading] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    // ---- Load all exclusion types once (for dropdown) ----
    useEffect(() => {
        async function fetchTypes() {
            try {
                const res = await fetch('/api/stats/exclusion_types');
                const data = await res.json(); // [{id, title}, ...]
                setAllTypes(data.exclusion_types);
            } catch (err) {
                console.error('Error fetching exclusion types', err);
            }
        }
        fetchTypes();
    }, []);

    // ---- Fetch time-series whenever filters change ----
    useEffect(() => {
        if (!selectedTypeIds.length) {
            setRows([]);
            return;
        }

        async function fetchTimeSeries() {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                params.set('types', selectedTypeIds.join(','));
                params.set('startYear', yearRange.start);
                params.set('endYear', yearRange.end);

                const res = await fetch(`/api/exclusions/time-series?${params.toString()}`);
                const data = await res.json();

                setRows(
                    data.map((d) => ({
                        year: Number(d.year),
                        exclusionTypeId: String(d.exclusionTypeId),
                        title: d.title,
                        deedCount: Number(d.deedCount),
                    })),
                );
            } catch (err) {
                console.error('Error fetching time series', err);
            } finally {
                setLoading(false);
            }
        }
        fetchTimeSeries();
    }, [selectedTypeIds, yearRange.start, yearRange.end]);

    // ---- Transform to Recharts "wide" format ----
    const { chartData, seriesMeta } = useMemo(() => {
        if (!rows.length) return { chartData: [], seriesMeta: [] };

        const years = new Set();
        const typeMap = new Map(); // id -> series metadata

        rows.forEach((r) => {
            years.add(r.year);
            if (!typeMap.has(r.exclusionTypeId)) {
                const idx = typeMap.size % DISTINCT_COLORS.length;
                typeMap.set(r.exclusionTypeId, {
                    id: r.exclusionTypeId,
                    key: `type_${r.exclusionTypeId}`,
                    title: r.title,
                    color: DISTINCT_COLORS[idx],
                });
            }
        });

        const sortedYears = Array.from(years).sort((a, b) => a - b);
        const byYear = new Map();
        sortedYears.forEach((y) => byYear.set(y, { year: y }));

        rows.forEach((r) => {
            const meta = typeMap.get(r.exclusionTypeId);
            if (!meta) return;
            const row = byYear.get(r.year);
            row[meta.key] = (row[meta.key] || 0) + r.deedCount;
        });

        return {
            chartData: Array.from(byYear.values()),
            seriesMeta: Array.from(typeMap.values()),
        };
    }, [rows]);

    // ---- Handle Apply from modal ----
    const handleApplyFilters = (nextSelectedTypes, nextYearRange) => {
        setSelectedTypeIds(nextSelectedTypes);
        setYearRange(nextYearRange);
        setFilterOpen(false);
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header + Filters button */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                }}
            >
                <h2 style={{ margin: 0 }}>Timeline of Exclusion Types</h2>

                <button
                    type="button"
                    onClick={() => setFilterOpen(true)}
                    style={{
                        padding: '0.35rem 0.9rem',
                        borderRadius: 9999,
                        border: '1px solid #d1d5db',
                        background: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#6b7280',
                        fontWeight: 500,
                    }}
                >
                    Filters ▾
                </button>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: 800, background: '#ffffff', borderRadius: 12 }}>
                {loading ? (
                    <p style={{ padding: '1rem' }}>Loading…</p>
                ) : !chartData.length ? (
                    <p style={{ padding: '1rem' }}>No data for this selection.</p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {seriesMeta.map((s) => (
                                <Bar
                                    key={s.id}
                                    dataKey={s.key}
                                    name={s.title}
                                    fill={s.color}
                                    barSize={4} // skinny bars to allow overlap
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Modal */}
            <FilterModal
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                allTypes={allTypes}
                selectedTypeIds={selectedTypeIds}
                yearRange={yearRange}
                onApply={handleApplyFilters}
            />
        </div>
    );
}

export default ExclusionTypeByYear;
