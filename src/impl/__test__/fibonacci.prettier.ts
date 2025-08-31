export function* fibonacci(): Generator<number, undefined, undefined> {
  let low: number = 0;
  let high: number = 1;
  while (true) {
    yield high;
    const sum = high + low;
    low = high;
    high = sum;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpYm9uYWNjaS50cy5tZCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQ0E0QkM7Q0FRQTtDQUNBO0NBTUE7Q0FTQTtDQUlBO0NBSUE7Q0FDQTtDQWhCQTtDQWZBIiwiZmlsZSI6ImZpYm9uYWNjaS50cyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3JpY2tvL3NyYy9lcy1qcy10cy9zcmMvcGFja2FnZXMvdHNtZC9pbXBsL19fdGVzdF9fIn0=
