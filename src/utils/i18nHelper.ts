export const getLocalizedContent = (item: any, field: string, language: string) => {
    if (!item) return '';
    if (language === 'ta' && item[`${field}_ta`]) {
        return item[`${field}_ta`];
    }
    return item[field];
};
