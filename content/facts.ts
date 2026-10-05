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
  showContactPhones: boolean;
  showAddress: boolean;
};

export type FactKey = keyof Facts;

export const facts: Facts = {
  nativeCustomerApp: false,
  agentApp: true,
  whatsappBooking: true,
  ticketAuthenticator: false,
  manifests: true,
  parcels: false,
  directToOperatorAccount: false,
  operatorOwnsData: false,
  showPaymentMarks: false,
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
