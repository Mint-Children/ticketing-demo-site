import React, { useMemo, useState } from 'react';
import { buildSeatMap, pickOccupiedSeatIds, GRADE_PALETTE } from '../data/seatMap';

const MAX_SEATS = 4;

export default function SeatMapModal({ show, date, time, initialSelected, onCancel, onConfirm }) {
  const rows = useMemo(() => buildSeatMap(show.seatGrades), [show]);
  const occupied = useMemo(() => pickOccupiedSeatIds(rows), [rows]);
  const [selected, setSelected] = useState(() => new Map(initialSelected.map((s) => [s.id, s])));

  const gradeColor = (gradeKey) => {
    const idx = show.seatGrades.findIndex((g) => g.key === gradeKey);
    return GRADE_PALETTE[idx % GRADE_PALETTE.length];
  };

  const toggleSeat = (seat) => {
    if (occupied.has(seat.id)) return;
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(seat.id)) {
        next.delete(seat.id);
      } else {
        if (next.size >= MAX_SEATS) return prev;
        next.set(seat.id, seat);
      }
      return next;
    });
  };

  const selectedList = [...selected.values()].sort((a, b) =>
    a.row === b.row ? a.num - b.num : a.row.localeCompare(b.row)
  );
  const totalPrice = selectedList.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="tk-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="tk-modal wide">
        <button className="tk-modal-close" onClick={onCancel} aria-label="닫기">×</button>
        <div className="tk-modal-eyebrow">SEAT MAP</div>
        <h2>좌석 선택</h2>
        <p className="tk-modal-desc">
          {show.title} · {date} {time}<br />
          원하는 좌석을 최대 {MAX_SEATS}석까지 직접 선택해 주세요.
        </p>

        <div className="tk-seatmap-legend">
          {show.seatGrades.map((g, i) => (
            <span key={g.key} className="tk-seatmap-legend-item">
              <i style={{ background: GRADE_PALETTE[i % GRADE_PALETTE.length].solid }} />
              {g.label} · {g.price.toLocaleString()}원
            </span>
          ))}
          <span className="tk-seatmap-legend-item">
            <i className="occupied-dot" />예매 완료
          </span>
        </div>

        <div className="tk-seatmap">
          <div className="tk-seatmap-stage">STAGE</div>
          {rows.map(({ row, gradeKey, seats }) => {
            const color = gradeColor(gradeKey);
            return (
              <div className="tk-seatmap-row" key={row}>
                <span className="tk-seatmap-row-label">{row}</span>
                <div className="tk-seatmap-seats">
                  {seats.map((seat) => {
                    const isOccupied = occupied.has(seat.id);
                    const isSelected = selected.has(seat.id);
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        className={`tk-seat${isSelected ? ' selected' : ''}${isOccupied ? ' occupied' : ''}`}
                        style={!isOccupied ? { '--seat-color': color.solid, '--seat-fill': color.fill } : undefined}
                        disabled={isOccupied}
                        onClick={() => toggleSeat(seat)}
                        aria-label={`${row}열 ${seat.num}번 ${seat.gradeLabel} 좌석${isOccupied ? ' (예매 완료)' : isSelected ? ' (선택됨)' : ''}`}
                      >
                        {seat.num}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="tk-seatmap-summary">
          <div className="tk-seatmap-summary-seats">
            {selectedList.length === 0
              ? '선택된 좌석이 없습니다'
              : selectedList.map((s) => `${s.gradeLabel} ${s.row}열 ${s.num}번`).join(', ')}
          </div>
          <div className="tk-seatmap-summary-total">
            <span>{selectedList.length}석</span>
            <b>{totalPrice.toLocaleString()}원</b>
          </div>
        </div>

        <div className="tk-modal-actions">
          <button className="tk-ghost-btn" style={{ flex: 1 }} onClick={onCancel}>취소</button>
          <button
            className="tk-book-btn"
            style={{ flex: 2 }}
            disabled={selectedList.length === 0}
            onClick={() => onConfirm(selectedList)}
          >
            예매하기
          </button>
        </div>
      </div>
    </div>
  );
}
