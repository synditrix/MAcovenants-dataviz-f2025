import { useEffect, useState } from 'react';
import {Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis} from "recharts";
import {BAR_CHART_COLORS} from '../utils.js'

const TopGrantors = () => {
    const [topGrantors, setTopGrantors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [
                  topGrantorsRes
                ] = await Promise.all([
                    fetch('/api/stats/top_grantors_regex_dedupe').then(r => r.json()),
                ]);
                setTopGrantors(topGrantorsRes.top_grantors_regex_dedupe.rows);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ width: '100%', height: 600 }}>
            <h2 style={{ margin: 0 }}>Top Grantors</h2>
        <ResponsiveContainer
            height="100%"
            width="100%"
        >
            <BarChart
                accessibilityLayer
                barCategoryGap="10%"
                barGap={1}
                data={topGrantors}
                height={100}
                layout="vertical"
                margin={{
                    bottom: 5,
                    left: 40,
                    right: 30,
                    top: 8
                }}
                syncMethod="index"
                width={600}
                responsive
            >
                <Bar
                    dataKey="deed_count"
                >
                    {topGrantors.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_CHART_COLORS[index % 20]} />
                    ))}
                    <LabelList
                        dataKey="deed_count"
                        position="left"
                        fill='#FFFFFF'
                    />
                    <LabelList
                        dataKey="normalized_grantor"
                        position="right"
                    />
                </Bar>
                <XAxis
                    dataKey="deed_count"
                    type="number"
                />
                <YAxis
                    dataKey="normalized_grantor"
                    hide
                    type="category"
                />
            </BarChart>
        </ResponsiveContainer>
        </div>
    )
}

export default TopGrantors;
