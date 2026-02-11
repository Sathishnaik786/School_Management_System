
const getPaginationRange = (page = 1, limit = 10) => {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 10);

    const from = (p - 1) * l;
    const to = from + l - 1;

    return { from, to, page: p, limit: l };
};

console.log("With undefined:", getPaginationRange(undefined, 100));
console.log("With NaN (Number(undefined)):", getPaginationRange(Number(undefined), 100));
console.log("With string '1':", getPaginationRange('1', 100));
