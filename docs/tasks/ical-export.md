Гілка main. Додай експорт розкладу аудиторії в iCalendar:
GET /rooms/:id/calendar.ics (text/calendar; charset=utf-8) для підписки з календаря.
Код у apps/api/src/calendar/.
Вимоги:
- RFC 5545: VCALENDAR/VEVENT, DTSTART/DTEND в UTC (суфікс Z), UID стабільний
  для бронювання; екранування `\`, `;`, `,` і переносів рядків у текстових полях;
  згортання рядків, довших за 75 октетів;
- лише активні бронювання (cancelledAt IS NULL);
- поле purpose у фід НЕ потрапляє: календар публічний, а purpose – вільний текст
  користувача; SUMMARY – «Зайнято», LOCATION – «<код>, <корпус>»;
- нових залежностей не додавай.
Готово, коли pnpm -r typecheck і pnpm --filter @roombook/api test зелені і є
тест на назву аудиторії з комою.
