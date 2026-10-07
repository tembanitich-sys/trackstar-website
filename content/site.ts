/**
 * All page copy lives here (Appendix A and B of the brief). Wording that
 * depends on a fact switch is composed in content/compose.ts from these parts.
 * No em dash characters anywhere in this file.
 */

import siteConfig from "../site.config.json";

/**
 * Product name, domain and public contact e-mail are settings in site.config.json; nothing
 * else writes them down. Page copy below uses them, so a rename is a change to that file.
 * The operator portal is a different site entirely.
 */
export const productName: string = siteConfig.productName;
/**
 * The name used inside legal text (the Privacy Notice and the consent wording next to the form
 * checkboxes). It is a separate setting so legal wording is only changed after review:
 * set `legalProductName` in site.config.json to the same value as `productName` to switch it.
 */
export const legalProductName: string = siteConfig.legalProductName;
/** The company responsible for the information in the Privacy Notice, also named in the footer copyright. */
export const legalEntityName: string = siteConfig.legalEntityName;
/**
 * The date the Privacy Notice takes effect, written as it should read ("12 November 2026"). Empty in the repo:
 * the test build then shows the highlighted placeholder, and a production build refuses to be made.
 */
export const legalEffectiveDate: string = siteConfig.legalEffectiveDate.trim();
if (process.env.NEXT_PUBLIC_INDEXABLE === "true" && legalEffectiveDate === "") {
  throw new Error("legalEffectiveDate is empty in site.config.json: set the Privacy Notice effective date before making a production build.");
}
/** How long the web host keeps its server logs, as the Privacy Notice states it. The host's own setting must match. */
export const hostLogRetention: string = siteConfig.hostLogRetention;
export const siteDomain: string = siteConfig.domain;
export const contactEmail: string = siteConfig.contactEmail;
export const portalUrl: string = siteConfig.portalUrl;

export const INSTATICKETS_URL = "https://www.instatickets.co.zw";
export const INSTATICKETS_BUSINESS_URL = "https://www.instatickets.co.zw/for-businesses";

export const privacyNoticeVersion = "2026-10-busrep-2";

export const seo = {
  title: `${productName} | Bus Ticketing & Transport Management Platform`,
  description:
    `${productName} gives bus operators a complete ticketing and transport management platform for bookings, payments, agents, digital tickets and daily operations, under their own brand.`,
};

export const cta = {
  primary: `GET ${productName}`,
  secondary: "BOOK A DEMO",
};

/** Query values that preset "How can TrackStar help?" */
export const helpPresets = { need: "need_system", demo: "demo" } as const;

/** Maps the `?help=` query value to a form preset. Anything else is the GET TRACKSTAR default. */
export function helpPresetFor(param: string | undefined): string {
  return param === "demo" ? helpPresets.demo : helpPresets.need;
}

/** `brand`: shown as that brand's logo (InstaTickets), with `label` as its alt text. */
export const nav: { label: string; href: string; brand?: "instatickets" }[] = [
  { label: "Platform", href: "/#platform" },
  { label: "Your Brand", href: "/#your-brand" },
  { label: "InstaTickets", href: "/#instatickets", brand: "instatickets" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export const operatorLogin = { label: "Operator portal", href: portalUrl };

export const topStrip = {
  prelaunch: {
    text: "Looking for a bus ticket? Passengers book through InstaTickets, launching November 2026.",
    link: "Pre-register on InstaTickets",
  },
  live: {
    text: "Looking for a bus ticket?",
    link: "Book on InstaTickets",
  },
};

export const hero = {
  h1: "YOUR TICKETING. YOUR BRAND. YOUR BUSINESS.",
  sub: "A complete ticketing and transport management platform for bus operators.",
  support:
    "Bookings, payments, agents, digital tickets and daily operations, all under your own brand.",
  status: "Live now and onboarding bus operators.",
};

export const noSolution = {
  headline: "NO TICKETING SOLUTION?",
  second: `DON'T WORRY. ${productName} HAS YOU COVERED.`,
  copy: `Your business should not have to wait for technology, or build its own. ${productName} gives you a complete, white-label ticketing platform, set up around your routes, your operation and your brand.`,
};

/** The ecosystem diagram under "Don't worry". Item titles stay sentence case, as in the mock-up; labels are capitals. */
export const ecosystem = {
  centreLine: "One platform, every channel",
  moreLine: "More wallets, banks and cards are added as partners join.",
  passengers: {
    label: "YOUR PASSENGERS",
    website: { title: "Website and online booking", line: "Your own branded site, booking 24/7" },
    customerApp: { title: "Customer app", line: "Search, book and pay in your app" },
    whatsapp: { title: "WhatsApp booking", line: "Passengers book in a chat they already use" },
  },
  team: {
    label: "YOUR TEAM",
    agentApp: { title: "Agent app", line: "Sell on the road", lineVerify: "Sell on the road, verify tickets at boarding", badge: "Works offline" },
    backOffice: { title: "Back office", line: "Routes, fleet, sales and reports", lineLive: "Routes, fleet, sales and reports, live" },
  },
  money: {
    label: "YOUR MONEY",
    titles: { "mobile-money": "Mobile money", cards: "Cards", bank: "Bank payments" },
  },
};

export const yourBrand = {
  headline: "YOUR BRAND. NOT OURS.",
  copy: `Your passengers see your business. ${productName} powers the technology behind it.`,
  points: {
    website: "Your website, in your name and your colours.",
    bookingWithWhatsapp: "Booking on mobile and WhatsApp under your brand.",
    bookingMobileOnly: "Booking on mobile under your brand.",
    tickets: "Tickets that carry your company name.",
    data: "Your passengers, your bookings and your data stay yours.",
  },
};

export const platform = {
  headline: "EVERYTHING YOU NEED TO RUN DIGITAL TICKETING.",
  closing: "One platform. Every channel. Your brand.",
  sell: {
    title: "SELL",
    lead: "Sell through",
    website: "your own website",
    mobileBooking: "mobile booking",
    customerApp: "customer app",
    whatsapp: "WhatsApp",
    agents: "your agents",
  },
  getPaid: {
    title: "GET PAID",
    line: "Take mobile money and card payments as part of every booking.",
    direct: "Payments go straight to your own account.",
  },
  run: {
    title: "RUN",
    line: "Manage routes, schedules, trips, seats, bookings and passengers.",
    manifests: "Print or share manifests.",
  },
  control: {
    title: "CONTROL",
    line: "Manage agents, branches, users and permissions from one back office.",
  },
  know: {
    title: "KNOW",
    line: "See sales, bookings, trips, routes and agent activity in clear reports.",
  },
  board: {
    title: "BOARD",
    line: "Issue digital tickets.",
    authenticator: `Validate them at boarding with ${productName} Ticket Authenticator.`,
  },
  parcels: {
    title: "PARCELS",
    line: "Register and track luggage and parcels alongside your passenger operation.",
  },
};

export const journey = {
  headline: "THE CUSTOMER JOURNEY",
  steps: [
    { title: "SEARCH", line: "Passengers choose departure, destination and travel date." },
    { title: "SELECT", line: "They pick a trip and a seat." },
    { title: "BOOK", line: "They enter passenger details." },
    { title: "PAY", line: "They pay by mobile money or card." },
    { title: "DIGITAL TICKET", line: "Passengers receive a digital ticket with a QR code." },
  ],
  /** Step 6 depends on the Ticket Authenticator and offline switches (see compose.ts). */
  boarding: {
    title: "CHECK IN AND BOARD",
    line: "Your team checks the ticket at departure.",
    verified: "Your team scans or verifies the ticket digitally at boarding",
    offline: ", even offline",
  },
};

export const operators = {
  headline: "BUILT FOR EVERY BUS OPERATOR.",
  forLabel: "WHO IT'S FOR",
  forRows: [
    "Intercity operators",
    "Cross-border operators",
    "Growing operators",
    "Established operators",
    "Operators moving from paper tickets",
  ],
  arrowLabel: ["ALL OF IT,", "FOR ALL"],
  getsLabel: "WHAT EVERY OPERATOR GETS",
  benefits: {
    channels: "Sell seats on every channel",
    paid: "Get paid",
    paidInstantly: "instantly",
    paidWith: "by mobile money and card",
    paidWithBank: "by mobile money, card and bank",
    realtime: "See every sale and seat in real time",
    lessCash: "Less cash handling at depots",
    grow: "Add routes, branches and agents without changing systems",
    nothingToBuild: "Nothing to build or maintain",
  },
};

export const instaTickets = {
  headline: `RUN YOUR BUSINESS WITH ${productName}. REACH MORE CUSTOMERS WITH INSTATICKETS.`,
  copy: `${productName} gives you the technology to run your own ticketing operation through your own channels. InstaTickets is a separate marketplace where passengers discover and book tickets from participating operators. Both are Bullion Technologies products.`,
  flow: {
    business: "YOUR BUSINESS",
    product: `${productName}`,
    channels: "YOUR OWN CHANNELS",
    optional: "Optional",
    instatickets: "INSTATICKETS",
    passengers: "MORE PASSENGERS",
  },
  points: [
    "Your own channels work on their own. Joining InstaTickets is your choice.",
    `${productName} is built to the InstaTickets integration standard and goes through the same certification as every other ticketing system.`,
    `Tickets sold through InstaTickets carry InstaTickets fees only. ${productName} fees apply only to tickets sold through your own ${productName} channels. No ticket is charged twice.`,
  ],
  explore: "EXPLORE INSTATICKETS",
  existing: {
    title: "ALREADY HAVE A TICKETING SYSTEM?",
    copy: "Keep it. Compatible ticketing systems may connect to InstaTickets, subject to integration requirements and approval.",
    link: "CONNECT YOUR SYSTEM TO INSTATICKETS",
  },
};

export const passengers = {
  headline: "LOOKING FOR A BUS TICKET?",
  prelaunch: {
    copy: `${productName} is technology for bus operators. Passengers will book through InstaTickets, launching November 2026. Pre-register now to hear first.`,
    button: "PRE-REGISTER ON INSTATICKETS",
  },
  live: {
    copy: `${productName} is technology for bus operators. To find and book a bus ticket, visit InstaTickets.`,
    button: "VISIT INSTATICKETS",
  },
};

export const faq = {
  headline: "FREQUENTLY ASKED QUESTIONS",
  items: [
    {
      q: `What is ${productName}?`,
      a: "A ticketing and transport management platform for bus operators. It runs your bookings, payments, agents, tickets and daily operations under your own brand.",
    },
    { q: `Is ${productName} live?`, a: "Yes. The platform is live and onboarding bus operators." },
    {
      q: "I don't have a ticketing system. Can I still go digital?",
      a: `Yes. That is what ${productName} is for. We set the platform up around your routes and your brand.`,
    },
    {
      q: `Will passengers see ${productName} or my company?`,
      a: `Your company. ${productName} works behind your brand.`,
    },
    {
      q: "Can my passengers pay with mobile money and cards?",
      a: "Yes. Both are part of the booking journey.",
    },
    {
      q: "Do I have to join InstaTickets?",
      a: "No. Your own channels work on their own. InstaTickets is an optional extra channel.",
    },
    {
      q: "Will I pay twice on tickets sold through InstaTickets?",
      a: `No. Tickets sold through InstaTickets carry InstaTickets fees only. ${productName} fees apply only to tickets sold through your own ${productName} channels.`,
    },
    {
      q: "I already have a ticketing system. What are my options?",
      a: "You can keep it. Compatible systems may connect to InstaTickets, subject to integration requirements and approval.",
    },
    {
      q: `What does ${productName} cost?`,
      a: "It depends on your operation. Send us your details and we will take you through it.",
    },
    { q: `Who is behind ${productName}?`, a: `${productName} is a Bullion Technologies product.` },
  ],
  /** Last FAQ entry: answer is the passenger wording for the current InstaTickets status. */
  ticketQuestion: "I want to buy a bus ticket.",
};

export const getTrackStar = {
  headline: "READY TO DIGITISE YOUR TICKETING?",
  copy: `Whether you are moving from paper, replacing an existing system or starting from scratch, ${productName} gives you the technology to move forward.`,
  fields: {
    fullName: "Full Name",
    company: "Company",
    mobile: "Mobile Number",
    email: "Email Address",
    country: "Country",
    fleetSize: "Fleet size",
    help: `How can ${productName} help?`,
    currentTicketing: "Current ticketing",
    systemName: "System name",
    message: "Message",
  },
  fleetSizes: [
    { value: "1-5", label: "1 to 5 buses" },
    { value: "6-15", label: "6 to 15" },
    { value: "16-40", label: "16 to 40" },
    { value: "40+", label: "More than 40" },
  ],
  helpTypes: [
    { value: "need_system", label: "I need a ticketing system" },
    { value: "replace_system", label: "I want to replace my current system" },
    { value: "demo", label: "I would like a demo" },
    { value: "connect_instatickets", label: "I want to connect my system to InstaTickets" },
    { value: "other", label: "Other" },
  ],
  currentTicketing: [
    { value: "none", label: "None or manual" },
    { value: "own_system", label: "Our own system" },
    { value: "not_sure", label: "Not sure" },
  ],
  marketing: `I would like to receive ${legalProductName} updates by email.`,
  privacyAck: `I have read the ${legalProductName} Privacy Notice.`,
  submit: "SEND MY REQUEST",
  successTitle: "THANK YOU. WE HAVE RECEIVED YOUR REQUEST.",
  successBody:
    `The ${productName} team will contact you to discuss your operation, a demo and onboarding.`,
};

export const contact = {
  headline: "GET IN TOUCH",
  emailLabel: "Email",
  phonesLabel: "Phone",
  addressLabel: "Address",
  operatorNote: `Bus operators interested in ${productName}: please use the Get ${productName} form.`,
  operatorLink: `Get ${productName} form`,
  fields: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    enquiryType: "Enquiry Type",
    message: "Message",
  },
  enquiryTypes: [
    { value: "general", label: "General" },
    { value: "sales", label: "Sales" },
    { value: "demo", label: "Demo" },
    { value: "integration", label: "Integration" },
    { value: "technical", label: "Technical" },
    { value: "other", label: "Other" },
  ],
  privacyAck: `I have read the ${legalProductName} Privacy Notice.`,
  submit: "SEND MESSAGE",
  successTitle: "THANK YOU. YOUR MESSAGE HAS BEEN RECEIVED.",
};

export const footer = {
  tagline: "YOUR TICKETING. YOUR BRAND. YOUR BUSINESS.",
  endorsement: "A BULLION TECHNOLOGIES PRODUCT",
  productsLead: "Bullion Technologies products:",
  links: [
    { label: "Platform", href: "/#platform" },
    { label: "Your Brand", href: "/#your-brand" },
    { label: "InstaTickets", href: "/#instatickets" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/contact" },
    { label: `Get ${productName}`, href: "/?help=need#get-busrep" },
    { label: "Operator portal", href: portalUrl },
  ],
  legal: [
    { label: "Privacy Notice", href: "/privacy" },
    { label: "Terms & Conditions (COMING SOON)", href: "/terms" },
    { label: "Cookie Policy (COMING SOON)", href: "/cookies" },
  ],
  copyright: `© 2026 ${legalEntityName}. All rights reserved.`,
};

export const comingSoon = {
  terms: { title: "TERMS & CONDITIONS", body: "COMING SOON" },
  cookies: { title: "COOKIE POLICY", body: "COMING SOON" },
};

/** Appendix B. Bracketed values stay visible until confirmed. */
export const privacy = {
  title: `${legalProductName} Privacy Notice`,
  effective: `Effective date: ${legalEffectiveDate || "[DATE PUBLISHED]"}`,
  intro:
    `This notice explains how ${legalProductName} handles the personal information you give us through this website. It does not cover the ${legalProductName} platform used by operators and their passengers, which has its own terms.`,
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        `${legalEntityName} is the company responsible for the information described in this notice. ${legalProductName} is its product. Registered address: 153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe.`,
      ],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "Operator enquiries: your name, company, mobile number, email address, country, fleet size, how we can help, details of any current ticketing system, your message, and whether you want marketing emails. If you arrived through a tagged campaign link, we also keep which campaign it was.",
        "Contact form: your name, email, phone number, enquiry type and message.",
        `Website use: we do not set cookies and we do not use analytics or advertising tools on this website. Like any website, our web host's server automatically records each request: your IP address, the date and time, the page requested, and your browser and device type. These server logs are kept for ${hostLogRetention} and used only to keep the site secure and working. Technical error logs, which may include an email address, are kept for up to 30 days. When you send one of our forms, we also keep a scrambled (hashed) version of your IP address for up to 24 hours to limit spam; your actual IP address is not stored with your enquiry.`,
      ],
    },
    {
      heading: "Why we use it",
      bullets: [
        "To respond to your enquiry, arrange a demo and discuss onboarding.",
        `To send ${legalProductName} updates, only if you ticked the marketing box.`,
        "To keep the website secure and to limit spam.",
      ],
    },
    {
      heading: "Who can see it",
      paragraphs: [
        "Only authorised Bullion Technologies staff and the service providers that host our website, database and email, who act on our instructions. Our website, database and email are hosted in Zimbabwe. Enquiry emails are also delivered to our Microsoft Outlook mailboxes, and Microsoft may store copies outside Zimbabwe; where it does, we take steps to protect your information as required by law.",
        "If your enquiry is about InstaTickets, we may share it with the InstaTickets team, which is also part of Bullion Technologies, so they can respond. We do not sell your information or share it with other companies for their own marketing.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        `Operator enquiries: 24 months from your last contact with us, unless you become a ${legalProductName} customer, in which case your customer agreement applies.`,
        "Contact form enquiries: 12 months after the enquiry is closed.",
      ],
    },
    {
      heading: "Your choices and rights",
      paragraphs: [
        "You can ask us to show you, correct or delete the information we hold about you, or stop sending you marketing emails at any time. Every marketing email will also tell you how to opt out.",
        `To make a request, email ${contactEmail} with the subject "Data Request". We will respond within 30 days.`,
        "If you are unhappy with how we handle your information, you may complain to the Data Protection Authority (POTRAZ).",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "We may update this notice. The effective date above shows when it last changed.",
      ],
    },
  ] as { heading: string; paragraphs?: string[]; bullets?: string[] }[],
};
