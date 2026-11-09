# RoomBook UI strings: Ukrainian → English

For readers of the English edition of *Developing with Codex*. The RoomBook
interface, error messages, seed data and test names are in Ukrainian. The code
listings in the English book are translated, so a functional string in a
listing (a `getByLabel(...)` label, a button name, an expected message) differs
from the string in the repository. When you type or run a listing from the
book, use the **Repository (UA)** column.

```ts
// book (English edition)                          // repository
await page.getByLabel("Start")                    // page.getByLabel("Початок")
await page.getByRole("button", { name: "Book" })  // { name: "Забронювати" }
await expect(...).toHaveText(/Booking confirmed/) // /Бронювання підтверджено/
```

Column **Book** says where the English string appears in the English edition
(chapter and listing). Rows without a chapter give a suggested translation for
strings that the book does not quote. Strings are those on `main` (tag
`ch18-end`); a string appears in the code from the tag given in **Since**.

Copy-paste tip: Ukrainian letters `і`, `а`, `о`, `е`, `р`, `с` look like Latin
letters but are different characters. Copy the strings from this file or from
the code; do not retype them.

## 1. Booking form and booking page (`apps/web/src/features/booking/`)

| Repository (UA) | English | Where | Since | Book / used by |
|---|---|---|---|---|
| `Аудиторія` | Room | `BookingForm.tsx`, label of the room `<select>` | ch02-start | Ch. 9 listing (`getByLabelText("Room")`) |
| `Початок` | Start | `BookingForm.tsx`, label | ch02-start | Ch. 9, Ch. 10 listings (`getByLabel("Start")`); e2e `booking-flow.spec.ts` |
| `Завершення` | End | `BookingForm.tsx`, label | ch02-start | Ch. 9, Ch. 10 (`getByLabel("End")`); e2e |
| `Мета бронювання` | Booking purpose | `BookingForm.tsx`, label | ch02-start | Ch. 9, Ch. 10 (`getByLabel("Booking purpose")`); e2e |
| `Забронювати` | Book | `BookingForm.tsx`, submit button; `RoomsPage.tsx`, link | ch02-start | Ch. 9, Ch. 10, Ch. 12 (`getByRole("button", { name: "Book" })`); e2e |
| `Бронювання` / `Бронювання A-214` | Booking / Booking A-214 | `BookRoomPage.tsx`, card title | ch02-start | – |
| `Бронювання підтверджено` | Booking confirmed | `BookRoomPage.tsx`, `role="status"` | ch02-start | Ch. 10 (`/Booking confirmed/`); e2e `booking-flow`, `booking-conflict` |
| `Аудиторія зайнята з 10:00 до 11:30` | Room is booked from 10:00 to 11:30 | `BookRoomPage.tsx`, status after 409 | ch02-start | Ch. 4, Ch. 10 (`/Room is booked/`); e2e |
| `Аудиторія зайнята` | Room is booked | `BookRoomPage.tsx`, 409 without details | ch02-start | Ch. 10 |
| `Не вдалося забронювати` | Booking failed | `BookRoomPage.tsx` | ch02-start | – |
| `Оберіть аудиторію` | Select a room | `messages.ts`, field error | ch02-start (in `messages.ts` since ch09-end) | Ch. 9 listing |
| `Вкажіть дату й час початку` | Enter the start date and time | `messages.ts`, `SlotForm.tsx` | ch09-end | Ch. 9 listing |
| `Вкажіть дату й час завершення` | Enter the end date and time | `messages.ts`, `SlotForm.tsx` | ch09-end | Ch. 9 listing |
| `Мета бронювання: щонайменше 3 символи` | Booking purpose: at least 3 characters | `messages.ts` | ch09-end | Ch. 9 listing and unit test |
| `Мета бронювання: не більше 500 символів` | Booking purpose: at most 500 characters | `messages.ts` | ch09-end | Ch. 9 listing |
| `Опишіть мету бронювання` | Describe the booking purpose | `messages.ts` | ch09-end | Ch. 9 listing |

## 2. Weekly series form (`SeriesForm.tsx`, `BookRoomPage.tsx`)

| Repository (UA) | English | Where | Since | Book / used by |
|---|---|---|---|---|
| `Щотижнева серія` | Weekly series | heading and form `aria-label` | ch04-end | – |
| `Перше заняття` | First session | label | ch04-end | e2e `recurring.spec.ts` |
| `Тривалість, хв` | Duration, min | label | ch04-end | e2e `recurring.spec.ts` |
| `До дати (включно)` | Until (inclusive) | label | ch04-end | e2e `recurring.spec.ts` |
| `Виключені дати` | Excluded dates | label | ch04-end | e2e `recurring.spec.ts` |
| `Мета серії` | Series purpose | label | ch04-end | e2e `recurring.spec.ts` |
| `Створити серію` | Create series | submit button | ch04-end | e2e `recurring.spec.ts` |
| `Серію створено: 16 занять` | Series created: 16 sessions | status | ch04-end | e2e `recurring.spec.ts` |
| `Зайняті дати: 2027-03-16` | Booked dates: 2027-03-16 | status after 409 | ch04-end | e2e `recurring.spec.ts` |
| `Не вдалося створити серію` | Could not create the series | status | ch04-end | – |
| `Перевірте поля серії` | Check the series fields | form error | ch04-end | – |

## 3. Consultations (`apps/web/src/features/consultations/`)

| Repository (UA) | English | Where | Since | Book / used by |
|---|---|---|---|---|
| `Консультації` | Consultations | nav link, card title | ch02-start | – |
| `Записатися` | Sign up | button for a slot with free seats | ch02-start | – |
| `Ви записалися на консультацію` | You have signed up for the consultation | status | ch02-start | – |
| `Записатися не вдалося` | Sign-up failed | status | ch02-start | – |
| `онлайн` | online | slot without a room | ch02-start | – |
| `вільно` | free (seats) | slot list | ch02-start | – |
| `Новий слот` | New slot | card title | ch02-start | – |
| `Кількість місць` | Number of seats | `SlotForm.tsx`, label | ch02-start | – |
| `Примітка` | Note | `SlotForm.tsx`, label | ch02-start | – |
| `Створити слот` | Create slot | `SlotForm.tsx`, button | ch02-start | – |
| `Кількість місць: від 1 до 30` | Number of seats: from 1 to 30 | `SlotForm.tsx`, field error | ch09-end | – |
| `Примітка: не більше 500 символів` | Note: at most 500 characters | `SlotForm.tsx`, field error | ch09-end | – |
| `Мої консультації` | My Consultations | nav link, card title | ch08-end | Ch. 8 (mockup, prompt) |
| `Майбутні` / `Минулі` | Upcoming / Past | tabs | ch08-end | Ch. 8 |
| `Скасувати` | Cancel | card button | ch08-end | Ch. 8 |
| `Аудиторія B-214` | Room B-214 | card | ch08-end | Ch. 8 mockup |
| `Немає запланованих консультацій` | No upcoming consultations | empty state | ch08-end | – |
| `Минулих консультацій немає` | No past consultations | empty state | ch08-end | – |
| `Стати в лист очікування` | Join the waitlist | `WaitlistButton.tsx` | ch14-end | – |
| `Ви в листі очікування, попереду: 2` | You are on the waitlist, ahead of you: 2 | `WaitlistButton.tsx`, status | ch14-end | – |
| `Вийти з листа` | Leave the waitlist | `WaitlistButton.tsx` | ch14-end | – |
| `Запис закрито: до початку менше 2 годин` | Sign-up closed: less than 2 hours before the start | `WaitlistButton.tsx`; API 422 `closed` | ch15-end | – |
| `У слоті є вільні місця – запишіться напряму` | The slot has free seats; sign up directly | `WaitlistButton.tsx`; API 422 `hasSeats` | ch14-end | – |
| `Ви вже записані або вже в листі очікування` | You are already signed up or already on the waitlist | `WaitlistButton.tsx` | ch14-end | – |
| `Не вдалося стати в лист очікування` | Could not join the waitlist | `WaitlistButton.tsx` | ch14-end | – |

## 4. Rooms, statistics, login (`RoomsPage.tsx`, `StatsPage.tsx`, `App.tsx`)

| Repository (UA) | English | Where | Since | Book / used by |
|---|---|---|---|---|
| `Аудиторії на 2027-03-16` | Rooms on 2027-03-16 | `RoomsPage.tsx`, heading | ch02-start | e2e `rooms.spec.ts` |
| `Аудиторія` / `Вільні пари` / `Зайнятість` | Room / Free periods / Occupancy | `RoomsPage.tsx`, table header | ch02-start | – |
| `Статистика` | Statistics | nav link | ch13-end | – |
| `Завантаженість аудиторій` | Room utilization | `StatsPage.tsx`, card title | ch13-end | – |
| `Від` / `До (не включно)` | From / To (exclusive) | `StatsPage.tsx`, labels | ch13-end | – |
| `Аудиторія` / `Пар` / `Завантаженість, %` | Room / Periods / Utilization, % | `StatsPage.tsx`; CSV header of the weekly report (`room-week.ts`, `legacy-php`) | ch11-end | Ch. 11 (`Room;Periods;Utilization, %`) |
| `Email для входу` | Login email | `App.tsx`, input `aria-label` | ch02-start | – |
| `Увійти (dev)` | Log in (dev) | `App.tsx`, button | ch02-start | – |
| `увійшли як teacher` | logged in as teacher | `App.tsx` | ch02-start | – |

## 5. API and shared error messages (`packages/shared/src`, `apps/api/src`)

These reach the UI through the `message` field of an error response or through
zod issues of the shared schemas.

| Repository (UA) | English | Where | Book |
|---|---|---|---|
| `Кінець бронювання має бути пізніше за початок` | The booking end must be later than the start | `packages/shared/src/booking.ts` (`BookingCreate`, `path: ["endsAt"]` since ch09-end) | Ch. 9 listing and unit test; Ch. 1 ("Booking end must be later than start", old version without `path`) |
| `Кінець консультації має бути пізніше за початок` | The consultation end must be later than the start | `booking.ts` (`SlotCreate`) | – |
| `Початок періоду має бути раніше за кінець` | The period start must be earlier than the end | `booking.ts` (stats query) | – |
| `Очікується дата у форматі YYYY-MM-DD` | Expected a date in the YYYY-MM-DD format | `booking.ts` | – |
| `Аудиторія зайнята на цей час` | The room is booked for this time | `errors.ts`, `ConflictError` (409) | – |
| `Частина дат серії зайнята` | Some dates of the series are booked | `recurrence/service.ts` (409) | – |
| `Серія не містить жодного заняття` | The series contains no sessions | `recurrence/service.ts` (400) | – |
| `Некоректні дані запиту` | Invalid request data | `errors.ts`, `app.ts` (400) | – |
| `… не знайдено` (`Аудиторію не знайдено`, `Бронювання не знайдено`) | … not found (Room not found, Booking not found) | `errors.ts`, `NotFoundError` (404) | – |
| `Недостатньо прав` | Insufficient permissions | `errors.ts`, `ForbiddenError` (403) | – |
| `Потрібен вхід` | Login required | `errors.ts`, `UnauthorizedError` (401) | – |
| `Скасувати можна лише власне бронювання` | You can cancel only your own booking | `booking/service.ts` (403) | – |
| `Ви вже записані на цю консультацію` | You are already signed up for this consultation | `slots/service.ts`, `waitlist/service.ts` (409) | – |
| `Вільних місць немає` | No free seats | `slots/service.ts` (409) | – |
| `Ви вже в листі очікування` | You are already on the waitlist | `waitlist/service.ts` (409) | – |
| `Тиждень звіту має починатися з понеділка` | The report week must start on a Monday | `reports/week.ts` | – |
| `Внутрішня помилка` | Internal error | `app.ts` (500) | – |
| `Нагадуємо: консультація у … о …` | Reminder: consultation with … at … | `reminders/service.ts`, email text | – |
| `Місце на консультації звільнилося – ви записані` | A seat in the consultation has become free: you are signed up | `waitlist/notify.ts`, email subject | – |

## 6. Seed data (`apps/api/prisma/seed-data.ts`)

| Repository (UA) | English | Note |
|---|---|---|
| `Викладач 1` … | Teacher 1 … | `teacher1@roombook.test` … |
| `Студент 01` … | Student 01 … | `student01@roombook.test` … |
| `Адміністратор` | Administrator | `admin@roombook.test` |
| `Канарка` | Canary | user 9001, Ch. 17 |
| `Корпус A`, `Корпус B` | Building A, Building B | – |
| `Лабораторія програмної інженерії` (A-314) | Software Engineering Lab | – |
| `Комп'ютерний клас` (A-214) | Computer lab | – |
| `Аудиторія для консультацій` (B-214) | Consultation room | – |
| `Лекційна аудиторія` (B-105) | Lecture hall | – |

## 7. Test names quoted in the book

Search for the Ukrainian name (`vitest run -t "…"`, `playwright test -g "…"`)
or open the file.

| Book (English) | Repository (UA) | File | Chapter |
|---|---|---|---|
| `expandWeekly` › includes the last day and skips excluded dates | `включає останній день і пропускає виключені дати` | `apps/api/test/recurrence.test.ts` | 4 |
| `expandWeekly` › keeps 14:00 Kyiv time after the switch to daylight saving time | `зберігає 14:00 за Києвом після переходу на літній час` | `apps/api/test/recurrence.test.ts` | 4 |
| `winter schedule`, `summer schedule` | (English in the repository too) | `apps/api/test/availability.test.ts` | 1–3 |
| binds the time error to the end field and focuses it | `прив'язує помилку часу до поля завершення і фокусує його` | `apps/web/src/features/booking/BookingForm.test.tsx` | 9 |
| booking conflict properties › P1: active bookings of one room do not overlap | `властивості конфліктів бронювань` › `P1: активні бронювання однієї аудиторії не перетинаються` | `apps/api/test/booking.properties.int.test.ts` | 10 |
| P2: a request is accepted iff it overlaps no accepted booking | `P2: запит приймається тоді й лише тоді, коли не перетинає прийнятих` | same | 10 |
| two adjacent periods in one room are booked without a conflict | `дві суміжні пари в одній аудиторії бронюються без конфлікту` | `apps/web/e2e/booking-flow.spec.ts` | 10 |
| (overlap shows a conflict) | `перетин з наявним бронюванням показує конфлікт` | `apps/web/e2e/booking-conflict.spec.ts` | 4, 10 |
| `room-week golden master` | (English in the repository too) | `apps/api/test/room-week.golden.test.ts` | 11 |
| availability: the number of SQL queries does not depend on the number of rooms | `availability: кількість SQL-запитів не залежить від числа аудиторій` | `apps/api/test/availability.queries.int.test.ts` | 12 |
| two parallel bookings of one slot: exactly one succeeds | `два паралельні бронювання одного слоту: рівно одне успішне` | `apps/api/test/booking.race.int.test.ts` | 12 |

Glossary of the domain words: *пара* = class period (90 min), *аудиторія* =
room, *консультація* = consultation (office hours), *лист очікування* =
waitlist, *заняття* = session, *викладач* = teacher, *кафедра* = department.
