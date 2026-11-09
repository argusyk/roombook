# API: лист очікування

Контракт – `packages/shared/src/waitlist.ts` (коди відповідей беремо з `waitlistRoutes`).

| Маршрут | Відповіді |
|---|---|
| `POST /slots/:slotId/waitlist` | 201 `{entry, ahead}`; 409 – уже в черзі або вже записаний; 422 `hasSeats` – у слоті є вільні місця |
| `DELETE /slots/:slotId/waitlist` | 204; 404 – користувача немає в черзі |
| `GET /me/waitlist` | 200 – записи зі статусом `waiting` і полем `ahead` |

## Правила
1. Черга FIFO в межах слота; `position` з 1.
2. Один користувач – щонайбільше один запис у черзі слота (`@@unique([slotId, userId])`).
3. Стати в чергу не можна, якщо вже маєш бронювання цього слота або в слоті є місця.
4. Скасування бронювання (`DELETE /bookings/:id`) у тій самій транзакції просуває
   першого в черзі: створює йому бронювання, `status = promoted`, `promotedAt`.
5. Утримання місця з таймером немає.

## Приклад

```http
POST /slots/12/waitlist
Authorization: Bearer dev-6

201 Created
{"entry":{"id":3,"slotId":12,"userId":6,"position":2,"status":"waiting",
          "createdAt":"2026-11-10T09:15:00.000Z"},"ahead":1}
```
