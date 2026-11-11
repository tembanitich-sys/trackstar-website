/**
 * Partner marks shown in the ecosystem diagram, to say which payment methods BusRep supports. Nothing here
 * suggests a partner endorses BusRep. The files are the partners' own (brand/partners/, read its README):
 * never recolour, outline, rotate or stretch them. Every mark is shown at the same visual size (the card
 * schemes require that no payment brand looks more prominent): 20 px tall, or 22 px for a symbol or boxed
 * logo that reads smaller than a wordmark at 20 px.
 *
 * To add one (OneMoney, O'mari, ...): copy its file to public/brand/partners/payments/ and add one line to
 * the right group below. `width` and `height` are the file's own proportions (viewBox or pixels).
 */
export type PartnerMark = {
  name: string;
  file: string;
  width: number;
  height: number;
  /** The chip behind the logo: "navy" only for white artwork. */
  chip: "light" | "navy";
  /** Rendered height in px. Default 20. */
  displayHeight?: 20 | 22;
};

const dir = "/brand/partners/payments/";

export type PaymentGroup = {
  key: "mobile-money" | "cards" | "bank";
  icon: "wallet" | "card" | "bank";
  marks: PartnerMark[];
};

export const paymentGroups: PaymentGroup[] = [
  {
    key: "mobile-money",
    icon: "wallet",
    marks: [
      { name: "EcoCash", file: `${dir}ecocash.svg`, width: 448.27, height: 83.5, chip: "light" },
      { name: "InnBucks", file: `${dir}innbucks-white.png`, width: 739, height: 204, chip: "navy" },
    ],
  },
  {
    key: "cards",
    icon: "card",
    marks: [
      { name: "Visa", file: `${dir}visa.png`, width: 1920, height: 622, chip: "light" },
      { name: "Mastercard", file: `${dir}mastercard.svg`, width: 117.15, height: 72.77, chip: "light", displayHeight: 22 },
    ],
  },
  {
    key: "bank",
    icon: "bank",
    marks: [{ name: "ZimSwitch", file: `${dir}zimswitch.svg`, width: 285.51, height: 150.01, chip: "light", displayHeight: 22 }],
  },
];

/** WhatsApp's official glyph (green on white or neutral): sits in the same icon tile as the other features. */
export const whatsappGlyph = { name: "WhatsApp", file: "/brand/partners/whatsapp-glyph.svg", size: 720 };
