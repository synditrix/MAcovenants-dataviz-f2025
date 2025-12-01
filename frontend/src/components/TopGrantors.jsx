import { useEffect, useState } from 'react';
import {Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis} from "recharts";

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
        <div style={{ width: '100%', height: 400 }}>
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
