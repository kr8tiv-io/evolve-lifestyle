// Public contact and policy facts used on the site and in JSON-LD.
// Keep these in one place so the visible text and the schema stay in sync.

export const SITE = "https://evolveapparel.shop";

export const CONTACT = {
  // Published on https://kr8tiv.io as the KR8TIV contact number.
  // Company-brain also records this as Matt's business / job-application
  // number. A separate personal "regular" number was not found in the brain.
  phoneDisplay: "780-915-5471",
  phoneTel: "+17809155471",
  email: "kr8tiv@kr8tiv.io",
};

export const KR8TIV = {
  name: "KR8TIV",
  url: "https://kr8tiv.io",
};

export const ECO_BLASTING = {
  name: "Evolve Eco Blasting",
  url: "https://www.evolveecoblasting.com",
};

export const FACEBOOK = "https://www.facebook.com/EvolveApparelCo";

export const TERMS_URL = `${SITE}/terms/`;

// Production time is "a few business days" on /terms/. Do not invent a
// dollar shipping rate; Printful calculates that at checkout.
export function offerShippingDetails() {
  return {
    "@type": "OfferShippingDetails",
    shippingDestination: [
      { "@type": "DefinedRegion", addressCountry: "CA" },
      { "@type": "DefinedRegion", addressCountry: "US" },
    ],
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 2,
        maxValue: 5,
        unitCode: "DAY",
      },
    },
  };
}

// Honest return policy from /terms/: all sales are final. Manufacturing
// defects reported within 14 days of delivery are exchanged or remade,
// and the shop covers the return shipping for those defects.
export function merchantReturnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: ["CA", "US"],
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    merchantReturnLink: TERMS_URL,
    url: TERMS_URL,
    name: "EVOLVE Apparel terms and returns",
    description:
      "All sales are final. We do not offer returns, refunds, or size or colour exchanges for change of mind. If an item arrives with a genuine manufacturing defect, reach out within 14 days of delivery with your order number and photos. We will exchange or remake the item and cover the return shipping for that defect.",
  };
}

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: "EVOLVE Apparel",
    alternateName: "EVOLVE",
    url: SITE,
    logo: {
      "@type": "ImageObject",
      url: `${SITE}/brand/evolve-lockup-white.png`,
    },
    description:
      "Western-Canadian outdoor lifestyle apparel. The apparel arm of Evolve Eco Blasting, and a KR8TIV company.",
    areaServed: ["CA", "US"],
    email: CONTACT.email,
    telephone: CONTACT.phoneDisplay,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phoneDisplay,
      email: CONTACT.email,
      contactType: "customer service",
      areaServed: ["CA", "US"],
      availableLanguage: ["English"],
    },
    parentOrganization: [
      {
        "@type": "Organization",
        name: KR8TIV.name,
        url: KR8TIV.url,
      },
      {
        "@type": "Organization",
        name: ECO_BLASTING.name,
        url: ECO_BLASTING.url,
      },
    ],
    sameAs: [FACEBOOK, ECO_BLASTING.url, KR8TIV.url],
  };
}
