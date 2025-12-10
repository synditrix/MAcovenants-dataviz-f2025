import { useEffect, useState } from 'react';

function formatNumber(n) {
    return n?.toLocaleString('en-US') ?? '–';
}

export function StatsOverview() {
    const [identified, setIdentified] = useState(null);
    const [confirmed, setConfirmed] = useState(null);
    const [pending, setPending] = useState(null);
    const [reviewNeeded, setReviewNeeded] = useState(null);
    const [falsePositive, setFalsePositive] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [
                    identifiedRes,
                    confirmedRes,
                    pendingRes,
                    reviewNeededRes,
                    falsePositiveRes
                ] = await Promise.all([
                    fetch('/api/stats/total-system-id-covenants').then(r => r.json()),
                    fetch('/api/stats/total-confirmed-covenants').then(r => r.json()),
                    fetch('/api/stats/total-pending-reviews').then(r => r.json()),
                    fetch('/api/stats/total_review_requested').then(r => r.json()),
                    fetch('/api/stats/total_false_positives').then(r => r.json()),
                ]);

                setIdentified(identifiedRes.total_system_id_covenants);
                setConfirmed(confirmedRes.total_confirmed_covenants);
                setPending(pendingRes.total_pending_reviews);
                setReviewNeeded(reviewNeededRes.total_review_requested);
                setFalsePositive(falsePositiveRes.total_false_positives);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) return <p>Loading...</p>;

    const items = [
        { label: "Deeds / System Identified", value: identified },
        { label: "Deeds / Manually Confirmed", value: confirmed },
        { label: "Deeds / Pending", value: pending },
        { label: "Deeds / Review Requested", value: reviewNeeded },
        { label: "Deeds / False Positive", value: falsePositive },
    ];

    return (
        <div className="stats-row">
            {items.map((item) => (
                <div key={item.label} className="stat-card">
                    <div className="stat-value">{formatNumber(item.value)}</div>
                    <div className="stat-label">{item.label}</div>
                </div>
            ))}
        </div>
    );
}
