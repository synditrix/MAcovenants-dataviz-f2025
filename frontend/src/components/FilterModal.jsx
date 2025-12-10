import { useEffect, useState } from 'react';

const COUNTIES = ["Worcester", "Norfolk_LR", "Northern Middlesex"];

function FilterModal({
                         open,
                         onClose,
                         allTypes,
                         selectedTypeIds,
                         yearRange,
                         selectedCounties,
                         onApply,
                     }) {
    const [localSelectedTypes, setLocalSelectedTypes] = useState([]);
    const [localYearRange, setLocalYearRange] = useState(yearRange);
    const [localCounties, setLocalCounties] = useState(COUNTIES);
    const [typesDropdownOpen, setTypesDropdownOpen] = useState(false);
    const [countiesDropdownOpen, setCountiesDropdownOpen] = useState(false);

    // Sync local state when modal opens / props change
    useEffect(() => {
        if (!open) return;
        setLocalSelectedTypes(selectedTypeIds);
        setLocalYearRange(yearRange);
        setLocalCounties(
            selectedCounties && selectedCounties.length ? selectedCounties : COUNTIES
        )
    }, [open, selectedTypeIds, yearRange, selectedCounties]);

    if (!open) return null;

    const toggleType = (id) => {
        setLocalSelectedTypes((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
        );
    };

    const toggleCounty = (name) => {
        setLocalCounties((prev) => {
            const exists = prev.includes(name);
            if (exists) {
                return prev.filter((c) => c !== name);
            }
            return [...prev, name];
        });
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

    const selectedCountiesLabel = (() => {
        if (!localCounties.length || localCounties.length === COUNTIES.length) {
            return 'All counties';
        }
        if (localCounties.length === 1) {
            return `County: ${localCounties[0]}`;
        }
        return `${localCounties.length} counties selected`;
    })();

    const handleApplyClick = () => {
        onApply(localSelectedTypes, localYearRange, localCounties);
    };

    return (
        <div className="overlay-style" onClick={onClose}>
            <div className="modal-style" onClick={(e) => e.stopPropagation()}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Counties</label>
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
                            onClick={() => setCountiesDropdownOpen((o) => !o)}
                        >
                            <span>{selectedCountiesLabel}</span>
                            <span style={{ fontSize: '0.7rem' }}>{countiesDropdownOpen ? '▴' : '▾'}</span>
                        </div>
                        {countiesDropdownOpen && (
                            <div
                                style={{
                                    marginTop: 4,
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    maxHeight: 180,
                                    overflowY: 'auto',
                                }}
                            >
                                {COUNTIES.map((name) => {
                                    const checked = localCounties.includes(name);
                                    return (
                                        <label
                                            key={name}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '0.45rem 0.7rem',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                color: '#4b5563',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleCounty(name)}
                                            />
                                            {name}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

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
