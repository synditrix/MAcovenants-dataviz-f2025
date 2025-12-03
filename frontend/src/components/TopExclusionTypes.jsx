import { useEffect, useState } from 'react';
import {Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis} from "recharts";

// TODO refactor this and topgrantors to be a reusable component just with different data
const TopExclusionTypes = () => {
    const [topExclusionTypes, setTopExclusionTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [
                  topExclusionTypesRes
                ] = await Promise.all([
                    fetch('/api/stats/top_exclusion_types_deed_review').then(r => r.json()),
                ]);
                setTopExclusionTypes(topExclusionTypesRes.top_exclusion_types_deed_review.rows);
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
        <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer
            height="100%"
            width="100%"
        >
            <BarChart
                accessibilityLayer
                barCategoryGap="10%"
                barGap={1}
                data={topExclusionTypes}
                height={100}
                layout="vertical"
                margin={{
                    bottom: 5,
                    left: 20,
                    right: 30,
                    top: 5
                }}
                syncMethod="index"
                width={500}
            >
                <Bar
                    dataKey="deed_count"
                    fill="#2563eb"
                >
                    <LabelList
                        dataKey="deed_count"
                        position="insideLeft"
                    />
                    <LabelList
                        dataKey="title"
                        position="right"
                    />
                </Bar>
                <XAxis
                    dataKey="deed_count"
                    type="number"
                />
                <YAxis
                    dataKey="title"
                    hide
                    type="category"
                />
            </BarChart>
        </ResponsiveContainer>
        </div>
    )
}

export default TopExclusionTypes;
