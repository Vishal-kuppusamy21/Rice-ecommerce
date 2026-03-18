export const formatPriceUnit = (unit: any) => {
    if (!unit || typeof unit !== 'string') return '';
    const normalized = unit.toLowerCase().trim();
    if (normalized === '1 kg' || normalized === '1kg') {
        return 'kg';
    }
    // Add space between number and unit if missing (e.g., '5kg' -> '5 kg')
    return unit.replace(/(\d+)([a-zA-Z]+)/, '$1 $2');
};
