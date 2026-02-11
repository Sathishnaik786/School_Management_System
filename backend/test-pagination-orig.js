
const getPaginationRangeOriginal = (page = 1, limit = 10) => {
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));

    const from = (p - 1) * l;
    const to = from + l - 1;

    return { from, to, page: p, limit: l };
};

console.log("Original with NaN:", getPaginationRangeOriginal(Number(undefined), 100));
