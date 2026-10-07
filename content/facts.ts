/**
 * Fact switches. A section, card or line tied to a switch that is false must
 * not render at all: no placeholder, no "coming soon".
 */
export type Facts = {
  nativeCustomerApp: boolean;
  agentApp: boolean;
  whatsappBooking: boolean;
  ticketAuthenticator: boolean;
  manifests: boolean;
  parcels: boolean;
  directToOperatorAccount: boolean;
  operatorOwnsData: boolean;
  showPaymentMarks: boolean;
  /** Agent app and boarding verification work without a connection ("Works offline", "even offline"). */
  worksOffline: boolean;
  /** Bank payments through ZimSwitch (the Bank payments row and its logo, "card and bank"). */
  bankPayments: boolean;
  /** Operators are paid instantly (real-time settlement). */
  instantSettlement: boolean;
  /** Sales and seats can be seen in real time ("live", "in real time"). */
  realtimeView: boolean;
  /** Less cash handling at depots. */
  lessCashHandling: boolean;
  showContactPhones: boolean;
  showAddress: boolean;
};

export type FactKey = keyof Facts;

export const facts: Facts = {
  nativeCustomerApp: true,
  agentApp: true,
  whatsappBooking: true,
  ticketAuthenticator: true,
  manifests: true,
  parcels: false,
  directToOperatorAccount: false,
  operatorOwnsData: false,
  showPaymentMarks: true,
  worksOffline: true,
  bankPayments: true,
  instantSettlement: true,
  realtimeView: true,
  lessCashHandling: true,
  showContactPhones: false,
  showAddress: false,
};

/**
 * InstaTickets status. Edit this and rebuild when InstaTickets goes live.
 * `prelaunch`: passengers are told to pre-register. `live`: passengers are sent to book.
 */
export const instaTicketsStatus: "prelaunch" | "live" = "prelaunch";

/** Values supplied later. Only rendered when the matching switch is true. */
export const contactDetails = {
  phones: [] as string[],
  address: "",
};
