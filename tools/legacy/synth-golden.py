#!/usr/bin/env python3
"""Синтетичні еталони тижневого звіту для навчального репозиторію RoomBook.

Справжні еталони знімає людина скриптом tools/legacy/capture-golden.sh зі
стенду php:7.4-cli + mysql:5.7 на замороженій копії бази. У публічному
репозиторії реальних даних немає, тому 96 пар файлів згенеровано цим скриптом:
вхід – кількість зайнятих пар за аудиторіями, вихід – CSV у тому самому
форматі, що й room_week.php (cp1251, ';', CRLF), з округленням як у PHP round():
половини від нуля після попереднього округлення до 15 значущих цифр.
Дані умовні. Запуск: python3 tools/legacy/synth-golden.py
"""
import datetime as dt
import json
import random
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "apps/api/test/golden/room-week"
SLOTS_PER_WEEK = 40
SEMESTERS = ["2023-09-04", "2024-02-05", "2024-09-02", "2025-02-03", "2025-09-01", "2026-02-02"]
ROOMS = sorted({f"{b}.{n:03d}" for b in range(1, 8) for n in (101, 105, 112, 203, 214, 217, 310)}
               - {"7.310", "6.310", "5.310"})          # 46 аудиторій
WEEKS_WITH_23 = {3: 2, 17: 1, 21: 1, 40: 2, 47: 1, 58: 1, 66: 1, 80: 1, 91: 1}  # 9 тижнів, 11 рядків


def php_round(value: float) -> int:
    pre = Decimal(repr(float(f"{value:.15g}")))      # попереднє округлення PHP
    return int(pre.quantize(Decimal(1), rounding=ROUND_HALF_UP))


def main() -> None:
    rng = random.Random(20261101)                     # знімок бази 01.11.2026
    OUT.mkdir(parents=True, exist_ok=True)
    weeks = [dt.date.fromisoformat(s) + dt.timedelta(weeks=i) for s in SEMESTERS for i in range(16)]
    assert len(ROOMS) == 46 and len(weeks) == 96
    for wi, monday in enumerate(weeks):
        pairs = {r: rng.choice([p for p in range(0, 41) if p != 23]) for r in ROOMS}
        for r in rng.sample(ROOMS, WEEKS_WITH_23.get(wi, 0)):
            pairs[r] = 23
        rows = [{"name": r, "pairs": pairs[r]} for r in ROOMS]
        rng.shuffle(rows)                             # GROUP BY r.id не гарантує порядку
        (OUT / f"{monday}.input.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        lines = ["Аудиторія;Пар;Завантаженість, %"] + [
            f"{r};{pairs[r]};{php_round(pairs[r] / SLOTS_PER_WEEK * 100)}" for r in sorted(ROOMS)]
        (OUT / f"{monday}.csv").write_bytes(("\r\n".join(lines) + "\r\n").encode("cp1251"))


if __name__ == "__main__":
    main()
