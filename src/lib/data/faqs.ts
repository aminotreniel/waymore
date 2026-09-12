export interface Faq {
  q: string;
  a: string;
  category: "getting-started" | "offers" | "payment" | "dealers";
}

export const FAQS: Faq[] = [
  {
    category: "getting-started",
    q: "Is there a fee to use Way More?",
    a: "No. Way More is completely free for sellers. There is no listing fee, no success fee, and nothing is deducted from your sale price. Dealers pay us a flat fee to participate in our events, which is how we make money — so our incentive is to bring you the strongest offers we can.",
  },
  {
    category: "getting-started",
    q: "How long does the whole process take?",
    a: "Most sellers finish the listing in under ten minutes. Your car goes into the next dealer event, bidding runs until Wednesday at 6:00 PM CT, and you'll have offers in hand the same evening. From there, accepting an offer and arranging pickup usually takes one to three days.",
  },
  {
    category: "getting-started",
    q: "What do I need to list my car?",
    a: "Your VIN or license plate, your current mileage, and about six photos taken on your phone. You'll also want your title handy — if there's still a loan on the car we'll help you handle the payoff.",
  },
  {
    category: "getting-started",
    q: "What condition does my car need to be in?",
    a: "Any condition. Dealers bid on everything from nearly new to high-mileage trade-ins. Being upfront about dents, warning lights, or accident history actually helps — it means the offers you receive are firm rather than getting revised at pickup.",
  },
  {
    category: "offers",
    q: "Do I have to accept an offer?",
    a: "Never. Every offer is completely no-obligation. If the numbers don't work for you, you can decline them all, counter the dealer you like best, or relist in next week's event at no cost.",
  },
  {
    category: "offers",
    q: "How is my estimate calculated?",
    a: "We combine the details you give us with current wholesale auction data, retail listings in your metro area, and what local dealers have actually paid for comparable vehicles in recent events. It's a range, not a promise — your real number comes from what dealers bid.",
  },
  {
    category: "offers",
    q: "Can I negotiate with a dealer?",
    a: "Yes. Every offer can be countered once directly from your Offers page. The dealer can accept your counter, come back with another number, or let it stand. Everything happens inside Way More, so there's no phone tag.",
  },
  {
    category: "offers",
    q: "How long is an offer good for?",
    a: "Offers stay open for 48 hours after the event closes. After that they expire automatically and the dealer is released — that's what keeps dealers comfortable bidding aggressively.",
  },
  {
    category: "dealers",
    q: "Who are the dealers?",
    a: "Licensed, franchised and independent dealerships in your area. Every dealer is verified against their state dealer licence and bond before they're allowed to bid, and we track how they behave after the sale — dealers who renegotiate at pickup get removed.",
  },
  {
    category: "dealers",
    q: "Will dealers call or text me constantly?",
    a: "No. Dealers never get your phone number or email. All contact runs through the messages in your portal, and it stops the moment you accept an offer or your listing closes.",
  },
  {
    category: "payment",
    q: "How and when do I get paid?",
    a: "Once the dealer verifies the car matches your listing, payment is released — usually the same day the vehicle is picked up. Most sellers choose ACH direct deposit, which lands in one to two business days. A printed check at pickup is also available.",
  },
  {
    category: "payment",
    q: "What if I still owe money on my car?",
    a: "That's common and it's not a problem. Tell us your lender and approximate payoff when you list. The dealer pays the lender directly and you receive the difference. If you owe more than the offer, you can pay the gap at pickup.",
  },
  {
    category: "payment",
    q: "Who picks up the car?",
    a: "The dealer does, at no cost to you, at a time you choose. They'll come to your home or workplace, confirm the vehicle and paperwork, and take it from there. You never have to drive to a dealership.",
  },
];

export const HOME_FAQS = FAQS.filter((f) =>
  ["Is there a fee to use Way More?", "Do I have to accept an offer?", "Who are the dealers?", "How and when do I get paid?"].includes(f.q),
);

export const FAQ_CATEGORIES: { key: Faq["category"]; label: string }[] = [
  { key: "getting-started", label: "Getting started" },
  { key: "offers", label: "Offers & bidding" },
  { key: "dealers", label: "Dealers" },
  { key: "payment", label: "Payment & pickup" },
];
