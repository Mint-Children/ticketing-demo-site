// seatMap.js — 가상 좌석 배치도 생성 유틸
// 공연의 좌석 등급(seatGrades)마다 열을 배정하고, 각 열에 좌석 번호를 채운 뒤
// 일부를 예매 완료(occupied) 상태로 무작위 지정해 실제 배치도처럼 보이게 한다.

const SEATS_PER_ROW = 12;
const ROWS_PER_GRADE = 2;
const ROW_LETTERS = 'ABCDEFGHIJ';
const OCCUPIED_RATIO = 0.28;

export const GRADE_PALETTE = [
  { solid: '#c23bd8', fill: 'rgba(194,59,216,.12)' },
  { solid: '#5b3df0', fill: 'rgba(91,61,240,.12)' },
  { solid: '#1f9d6b', fill: 'rgba(31,157,107,.12)' },
  { solid: '#f0a04b', fill: 'rgba(240,160,75,.14)' },
];

export function buildSeatMap(seatGrades) {
  const rows = [];
  let rowIdx = 0;
  seatGrades.forEach((grade) => {
    for (let r = 0; r < ROWS_PER_GRADE; r++) {
      const rowLabel = ROW_LETTERS[rowIdx];
      rowIdx++;
      const seats = [];
      for (let n = 1; n <= SEATS_PER_ROW; n++) {
        seats.push({
          id: `${rowLabel}${n}`,
          row: rowLabel,
          num: n,
          gradeKey: grade.key,
          gradeLabel: grade.label,
          price: grade.price,
        });
      }
      rows.push({ row: rowLabel, gradeKey: grade.key, seats });
    }
  });
  return rows;
}

export function pickOccupiedSeatIds(rows) {
  const all = rows.flatMap((r) => r.seats.map((s) => s.id));
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  const count = Math.floor(all.length * OCCUPIED_RATIO);
  return new Set(shuffled.slice(0, count));
}
