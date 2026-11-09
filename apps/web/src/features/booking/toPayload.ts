import { kyivLocalToIso } from "../../lib/time";

/** Стан форми бронювання: значення полів як рядки. */
export interface BookingFormValues {
  roomId: string;
  startsAt: string; // datetime-local, київський час
  endsAt: string;
  purpose: string;
}

/** Перетворює значення форми на тіло POST /bookings (ще без валідації). */
export function toPayload(values: BookingFormValues) {
  return {
    roomId: values.roomId ? Number(values.roomId) : undefined,
    startsAt: kyivLocalToIso(values.startsAt),
    endsAt: kyivLocalToIso(values.endsAt),
    purpose: values.purpose.trim(),
  };
}
