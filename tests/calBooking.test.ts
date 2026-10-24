import { parseBooking } from "@/components/ui/CalEmbed";

const v2 = {
  fullType: "CAL:book:bookingSuccessfulV2",
  data: {
    uid: "abc",
    title: "30 Minute Meeting",
    startTime: "2026-10-27T05:30:00.000Z",
    status: "ACCEPTED",
  },
};

describe("parseBooking", () => {
  it("reads a confirmed booking from the embed or the plain iframe", () => {
    const booked = { title: "30 Minute Meeting", startTime: "2026-10-27T05:30:00.000Z" };
    expect(parseBooking("https://app.cal.com", v2)).toEqual({
      ...booked,
      pending: false,
      rescheduled: false,
    });
    expect(
      parseBooking("https://cal.com", { ...v2, fullType: "CAL:true:bookingSuccessfulV2" }),
    ).toEqual({ ...booked, pending: false, rescheduled: false });
  });

  it("flags bookings that still need confirmation, and reschedules", () => {
    expect(
      parseBooking("https://cal.com", { ...v2, data: { ...v2.data, status: "PENDING" } })?.pending,
    ).toBe(true);
    expect(
      parseBooking("https://cal.com", { ...v2, fullType: "CAL:book:rescheduleBookingSuccessfulV2" })
        ?.rescheduled,
    ).toBe(true);
    // The older event nests the booking and reports `confirmed`.
    expect(
      parseBooking("https://cal.com", {
        fullType: "CAL:book:bookingSuccessful",
        data: { booking: { title: "Call", startTime: v2.data.startTime }, confirmed: false },
      }),
    ).toMatchObject({ title: "Call", pending: true });
  });

  it("ignores other events and other origins", () => {
    expect(parseBooking("https://evil.example", v2)).toBeNull();
    expect(
      parseBooking("https://cal.com", { fullType: "CAL:book:linkReady", data: {} }),
    ).toBeNull();
    expect(parseBooking("https://cal.com", "CAL:book:bookingSuccessfulV2")).toBeNull();
    expect(parseBooking("https://cal.com", null)).toBeNull();
  });
});
