import { useEffect, useState } from 'react';

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
};

const modalStyle = {
    width: 480,
    maxWidth: '90vw',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: '1.5rem',
    boxShadow: '0 25px 50px rgba(15, 23, 42, 0.25)',
};

function FilterModal({
                         open,
                         onClose,
                         allTypes,
                         selectedTypeIds,
                         yearRange,
                         onApply,
                     }) {
    const [localSelectedTypes, setLocalSelectedTypes] = useState([]);
    const [localYearRange, setLocalYearRange] = useState(yearRange);
    const [typesDropdownOpen, setTypesDropdownOpen] = useState(false);

    // Sync local state when modal opens / props change
    useEffect(() => {
        if (!open) return;
        setLocalSelectedTypes(selectedTypeIds);
        setLocalYearRange(yearRange);
    }, [open, selectedTypeIds, yearRange]);

    if (!open) return null;

    const toggleType = (id) => {
        setLocalSelectedTypes((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
        );
    };

    const handleYearChange = (field, value) => {
        const n = Number(value);
        if (Number.isNaN(n)) return;
        setLocalYearRange((prev) => ({ ...prev, [field]: n }));
    };

    const selectedLabel = (() => {
        if (!localSelectedTypes.length) return 'No exclusion types selected';
        if (localSelectedTypes.length === 1) {
            const found = allTypes.find((t) => String(t.id) === localSelectedTypes[0]);
            return found ? `Exclusion Type: ${found.title}` : '1 type selected';
        }
        return `${localSelectedTypes.length} exclusion types selected`;
    })();

    const handleApplyClick = () => {
        onApply(localSelectedTypes, localYearRange);
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Filters</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        ×
                    </button>
                </div>

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Counties placeholder */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Counties</label>
                        <div
                            style={{
                                marginTop: 4,
                                borderRadius: 8,
                                border: '1px solid #d1d5db',
                                padding: '0.4rem 0.7rem',
                                fontSize: '0.85rem',
                                color: '#9ca3af',
                            }}
                        >
                            (Not implemented yet)
                        </div>
                    </div>

                    {/* Exclusion Types dropdown */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Exclusion Types</label>
                        <div
                            style={{
                                marginTop: 4,
                                borderRadius: 8,
                                border: '1px solid #d1d5db',
                                padding: '0.4rem 0.7rem',
                                fontSize: '0.85rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                            onClick={() => setTypesDropdownOpen((o) => !o)}
                        >
                            <span>{selectedLabel}</span>
                            <span style={{ fontSize: '0.7rem' }}>{typesDropdownOpen ? '▴' : '▾'}</span>
                        </div>

                        {typesDropdownOpen && (
                            <div
                                style={{
                                    marginTop: 4,
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    maxHeight: 180,
                                    overflowY: 'auto',
                                }}
                            >
                                {allTypes.map((t) => {
                                    const id = String(t.id);
                                    const checked = localSelectedTypes.includes(id);
                                    return (
                                        <label
                                            key={id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '0.45rem 0.7rem',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                color: '#9ca3af',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleType(id)}
                                            />
                                            {t.title}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Date range */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Date Range</label>
                        <div
                            style={{
                                marginTop: 4,
                                borderRadius: 8,
                                border: '1px solid #d1d5db',
                                padding: '0.4rem 0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <input
                                type="number"
                                value={localYearRange.start}
                                onChange={(e) => handleYearChange('start', e.target.value)}
                                style={{ width: 80, border: 'none', outline: 'none', fontSize: '0.85rem' }}
                            />
                            <span>–</span>
                            <input
                                type="number"
                                value={localYearRange.end}
                                onChange={(e) => handleYearChange('end', e.target.value)}
                                style={{ width: 80, border: 'none', outline: 'none', fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Apply button */}
                <button
                    type="button"
                    onClick={handleApplyClick}
                    style={{
                        marginTop: '1.5rem',
                        width: '100%',
                        borderRadius: 9999,
                        border: 'none',
                        padding: '0.6rem 0',
                        backgroundColor: '#1f6a7a',
                        color: '#ffffff',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    Apply
                </button>
            </div>
        </div>
    );
}

export default FilterModal;
