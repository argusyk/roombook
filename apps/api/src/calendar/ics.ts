// iCalendar (RFC 5545) для підписки на розклад аудиторії (розд. 13, PR #206).
// Поле purpose у фід не потрапляє: календар публічний, а purpose – вільний
// текст користувача (і канал ін'єкції, розд. 17).

export interface IcsRoom {
  id: number;
  code: string;
  building: string;
}

export interface IcsBooking {
  id: number;
  startsAt: Date;
  endsAt: Date;
}

/** Екранування TEXT (RFC 5545, 3.3.11): \ ; , і переноси рядків. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Згортання рядків довших за 75 октетів (RFC 5545, 3.1): CRLF + пробіл. */
export function foldLine(line: string): string {
  const out: string[] = [];
  let current = "";
  let octets = 0;
  for (const ch of line) {
    const size = Buffer.byteLength(ch, "utf8");
    const limit = out.length === 0 ? 75 : 74; // продовження починається з пробілу
    if (octets + size > limit) {
      out.push(current);
      current = "";
      octets = 0;
    }
    current += ch;
    octets += size;
  }
  out.push(current);
  return out.join("\r\n ");
}

const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function buildCalendar(room: IcsRoom, bookings: IcsBooking[], now = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RoomBook//Room calendar//UK",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(`RoomBook ${room.code}`)}`,
  ];
  for (const b of bookings) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:booking-${b.id}@roombook`,
      `DTSTAMP:${utc(now)}`,
      `DTSTART:${utc(b.startsAt)}`,
      `DTEND:${utc(b.endsAt)}`,
      "SUMMARY:Зайнято",
      `LOCATION:${escapeText(`${room.code}, ${room.building}`)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
