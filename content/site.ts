/**
 * All page copy lives here (Appendix A and B of the brief). Wording that
 * depends on a fact switch is composed in content/compose.ts from these parts.
 * No em dash characters anywhere in this file.
 */

import siteConfig from "../site.config.json";

/**
 * The website's domain comes from site.config.json (one setting). Everything derived from it,
 * such as the public contact e-mail, follows. The operator portal is a different site entirely.
 */
export const siteDomain: string = siteConfig.domain;
export const portalUrl: string = siteConfig.portalUrl;

export const INSTATICKETS_URL = "https://www.instatickets.co.zw";
export const INSTATICKETS_BUSINESS_URL = "https://www.instatickets.co.zw/for-businesses";

export const privacyNoticeVersion = "2026-10-trackstar";
export const contactEmail = `info@${siteDomain}`;

export const seo = {
  title: "TrackStar | Bus Ticketing & Transport Management Platform",
  description:
    "TrackStar gives bus operators a complete ticketing and transport management platform for bookings, payments, agents, digital tickets and daily operations, under their own brand.",
};

export const cta = {
  primary: "GET TRACKSTAR",
  secondary: "BOOK A DEMO",
};

/** Query values that preset "How can TrackStar help?" */
export const helpPresets = { need: "need_system", demo: "demo" } as const;

/** Maps the `?help=` query value to a form preset. Anything else is the GET TRACKSTAR default. */
export function helpPresetFor(param: string | undefined): string {
  return param === "demo" ? helpPresets.demo : helpPresets.need;
}

export const nav = [
  { label: "Platform", href: "/#platform" },
  { label: "Your Brand", href: "/#your-brand" },
  { label: "InstaTickets", href: "/#instatickets" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export const operatorLogin = { label: "Operator login", href: portalUrl };

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
  second: "DON'T WORRY. TRACKSTAR HAS YOU COVERED.",
  copy: "Your business should not have to wait for technology, or build its own. TrackStar gives you a complete, white-label ticketing platform, set up around your routes, your operation and your brand.",
  chips: {
    website: "Your own website",
    mobileBooking: "Mobile booking",
    customerApp: "Customer app",
    agentApp: "Agent app",
    whatsapp: "WhatsApp booking",
    payments: "Mobile money and card payments",
    tickets: "Digital tickets",
    backOffice: "Full back office",
  },
};

export const yourBrand = {
  headline: "YOUR BRAND. NOT OURS.",
  copy: "Your passengers see your business. TrackStar powers the technology behind it.",
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
    authenticator: "Validate them at boarding with TrackStar Ticket Authenticator.",
  },
  parcels: {
    title: "PARCELS",
    line: "Register and track luggage and parcels alongside your passenger operation.",
  },
};

export const journey = {
  headline: "FROM SEARCH TO BOARDING.",
  steps: [
    { title: "SEARCH", line: "Passengers choose departure, destination and travel date." },
    { title: "SELECT", line: "They pick a trip and a seat." },
    { title: "BOOK", line: "They enter passenger details." },
    { title: "PAY", line: "They pay by mobile money or card." },
    { title: "TICKET", line: "A digital ticket arrives in your name." },
    { title: "BOARD", line: "Your team checks the ticket at departure." },
  ],
};

export const audience = {
  headline: "BUILT FOR BUS OPERATORS.",
  cards: [
    { title: "INTERCITY OPERATORS", line: "Sell every route and every seat from one platform." },
    { title: "CROSS-BORDER OPERATORS", line: "Take bookings from passengers wherever they are." },
    { title: "GROWING OPERATORS", line: "Add routes, branches and agents without changing systems." },
    { title: "ESTABLISHED OPERATORS", line: "Modernise how you sell and manage tickets." },
    {
      title: "STARTING FROM PAPER",
      line: "Move from manual ticketing to digital, without building anything yourself.",
    },
  ],
};

export const instaTickets = {
  headline: "RUN YOUR BUSINESS WITH TRACKSTAR. REACH MORE CUSTOMERS WITH INSTATICKETS.",
  copy: "TrackStar gives you the technology to run your own ticketing operation through your own channels. InstaTickets is a separate marketplace where passengers discover and book tickets from participating operators. Both are Bullion Technologies products.",
  flow: {
    business: "YOUR BUSINESS",
    trackstar: "TRACKSTAR",
    channels: "YOUR OWN CHANNELS",
    optional: "Optional",
    instatickets: "INSTATICKETS",
    passengers: "MORE PASSENGERS",
  },
  points: [
    "Your own channels work on their own. Joining InstaTickets is your choice.",
    "TrackStar is built to the InstaTickets integration standard and goes through the same certification as every other ticketing system.",
    "Tickets sold through InstaTickets carry InstaTickets fees only. TrackStar fees apply only to tickets sold through your own TrackStar channels. No ticket is charged twice.",
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
    copy: "TrackStar is technology for bus operators. Passengers will book through InstaTickets, launching November 2026. Pre-register now to hear first.",
    button: "PRE-REGISTER ON INSTATICKETS",
  },
  live: {
    copy: "TrackStar is technology for bus operators. To find and book a bus ticket, visit InstaTickets.",
    button: "VISIT INSTATICKETS",
  },
};

export const faq = {
  headline: "FREQUENTLY ASKED QUESTIONS",
  items: [
    {
      q: "What is TrackStar?",
      a: "A ticketing and transport management platform for bus operators. It runs your bookings, payments, agents, tickets and daily operations under your own brand.",
    },
    { q: "Is TrackStar live?", a: "Yes. The platform is live and onboarding bus operators." },
    {
      q: "I don't have a ticketing system. Can I still go digital?",
      a: "Yes. That is what TrackStar is for. We set the platform up around your routes and your brand.",
    },
    {
      q: "Will passengers see TrackStar or my company?",
      a: "Your company. TrackStar works behind your brand.",
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
      a: "No. Tickets sold through InstaTickets carry InstaTickets fees only. TrackStar fees apply only to tickets sold through your own TrackStar channels.",
    },
    {
      q: "I already have a ticketing system. What are my options?",
      a: "You can keep it. Compatible systems may connect to InstaTickets, subject to integration requirements and approval.",
    },
    {
      q: "What does TrackStar cost?",
      a: "It depends on your operation. Send us your details and we will take you through it.",
    },
    { q: "Who is behind TrackStar?", a: "TrackStar is a Bullion Technologies product." },
  ],
  /** Last FAQ entry: answer is the passenger wording for the current InstaTickets status. */
  ticketQuestion: "I want to buy a bus ticket.",
};

export const getTrackStar = {
  headline: "READY TO DIGITISE YOUR TICKETING?",
  copy: "Whether you are moving from paper, replacing an existing system or starting from scratch, TrackStar gives you the technology to move forward.",
  fields: {
    fullName: "Full Name",
    company: "Company",
    mobile: "Mobile Number",
    email: "Email Address",
    country: "Country",
    fleetSize: "Fleet size",
    help: "How can TrackStar help?",
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
  marketing: "I would like to receive TrackStar updates by email.",
  privacyAck: "I have read the TrackStar Privacy Notice.",
  submit: "SEND MY REQUEST",
  successTitle: "THANK YOU. WE HAVE RECEIVED YOUR REQUEST.",
  successBody:
    "The TrackStar team will contact you to discuss your operation, a demo and onboarding.",
};

export const contact = {
  headline: "GET IN TOUCH",
  emailLabel: "Email",
  phonesLabel: "Phone",
  addressLabel: "Address",
  operatorNote: "Bus operators interested in TrackStar: please use the Get TrackStar form.",
  operatorLink: "Get TrackStar form",
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
  privacyAck: "I have read the TrackStar Privacy Notice.",
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
    { label: "Get TrackStar", href: "/?help=need#get-trackstar" },
    { label: "Operator login", href: portalUrl },
  ],
  legal: [
    { label: "Privacy Notice", href: "/privacy" },
    { label: "Terms & Conditions (COMING SOON)", href: "/terms" },
    { label: "Cookie Policy (COMING SOON)", href: "/cookies" },
  ],
  copyright: "© 2026 TrackStar. All rights reserved.",
};

export const comingSoon = {
  terms: { title: "TERMS & CONDITIONS", body: "COMING SOON" },
  cookies: { title: "COOKIE POLICY", body: "COMING SOON" },
};

/** Appendix B. Bracketed values stay visible until confirmed. */
export const privacy = {
  title: "TRACKSTAR PRIVACY NOTICE",
  effective: "Effective date: [DATE PUBLISHED]",
  intro:
    "This notice explains how TrackStar handles the personal information you give us through this website. It does not cover the TrackStar platform used by operators and their passengers, which has its own terms.",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "TrackStar is operated by [REGISTERED COMPANY NAME], a Bullion Technologies company, [REGISTERED ADDRESS]. We are responsible for the information described in this notice.",
      ],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "Operator enquiries: your name, company, mobile number, email address, country, fleet size, how we can help, details of any current ticketing system, your message, and whether you want marketing emails.",
        "Contact form: your name, email, phone number, enquiry type and message.",
        "Website use: basic, anonymous usage statistics, collected without cookies.",
      ],
    },
    {
      heading: "Why we use it",
      bullets: [
        "To respond to your enquiry, arrange a demo and discuss onboarding.",
        "To send TrackStar updates, only if you ticked the marketing box.",
        "To keep the website secure and understand how it is used.",
      ],
    },
    {
      heading: "Who can see it",
      paragraphs: [
        "Only authorised TrackStar staff and the service providers that host our website, database and email, who act on our instructions. Some of these providers may store information outside Zimbabwe; where they do, we take steps to protect it as required by law.",
        "If your enquiry is about InstaTickets, we may share it with the InstaTickets team, which is also part of Bullion Technologies, so they can respond. We do not sell your information or share it with other companies for their own marketing.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "Operator enquiries: [24] months from your last contact with us, unless you become a TrackStar customer, in which case your customer agreement applies.",
        "Contact form enquiries: [12] months after the enquiry is closed.",
      ],
    },
    {
      heading: "Your choices and rights",
      paragraphs: [
        "You can ask us to show you, correct or delete the information we hold about you, or stop sending you marketing emails at any time. Every marketing email will also tell you how to opt out.",
        `To make a request, email ${contactEmail} with the subject "Data Request". We will respond within [30] days.`,
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
