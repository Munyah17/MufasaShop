export type DeliveryMethod = "delivery" | "collection";

export interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  fee: number; // USD
}

export interface DeliveryCity {
  city: string;
  zones: DeliveryZone[];
}

// InDrive-calibrated flat rates per zone (USD)
export const DELIVERY_CITIES: DeliveryCity[] = [
  {
    city: "Harare",
    zones: [
      {
        id: "hrr-cbd",
        name: "CBD & Avenues",
        areas: ["CBD", "Harare Central", "Kopje", "Avenues", "Milton Park", "Eastlea", "Belgravia"],
        fee: 3,
      },
      {
        id: "hrr-north",
        name: "Northern Suburbs",
        areas: [
          "Borrowdale", "Borrowdale Brooke", "Glen Lorne", "Chisipite",
          "Highlands", "Mount Pleasant", "Avondale", "Greendale", "Msasa",
          "Mandara", "Colne Valley",
        ],
        fee: 4,
      },
      {
        id: "hrr-west",
        name: "Western Suburbs",
        areas: [
          "Mabelreign", "Marlborough", "Westgate", "Warren Park",
          "Dzivarasekwa", "Kuwadzana", "Zengeza", "Hatcliffe",
        ],
        fee: 5,
      },
      {
        id: "hrr-east",
        name: "Eastern Suburbs",
        areas: ["Hatfield", "Waterfalls", "Prospect", "Tafara", "Mabvuku", "Marimba", "Cranborne"],
        fee: 5,
      },
      {
        id: "hrr-south",
        name: "Southern Suburbs",
        areas: [
          "Highfield", "Budiriro", "Glen View", "Mufakose",
          "Kambuzuma", "Sunningdale", "Dzivarasekwa",
        ],
        fee: 5,
      },
      {
        id: "hrr-greater",
        name: "Greater Harare",
        areas: [
          "Chitungwiza", "Unit A", "Unit B", "Unit C", "Unit D",
          "Ruwa", "Norton", "Epworth", "Seke", "Domboshava",
        ],
        fee: 10,
      },
    ],
  },
  {
    city: "Bulawayo",
    zones: [
      {
        id: "byo-city",
        name: "City Center & Near Suburbs",
        areas: [
          "Bulawayo CBD", "Selbourne Park", "Suburbs", "Queens Park",
          "Hillside", "Famona", "Burnside", "Matsheumhlope",
        ],
        fee: 12,
      },
      {
        id: "byo-outer",
        name: "Outer Areas",
        areas: [
          "Luveve", "Nkulumane", "Pumula", "Cowdray Park",
          "Entumbane", "Lobengula", "Njube", "Makokoba",
        ],
        fee: 15,
      },
    ],
  },
  {
    city: "Mutare",
    zones: [
      {
        id: "mut-city",
        name: "City & Suburbs",
        areas: ["Mutare CBD", "Sakubva", "Dangamvura", "Hobhouse", "Yeovil", "Greenside"],
        fee: 12,
      },
      {
        id: "mut-outer",
        name: "Outer Areas",
        areas: ["Fairbridge Park", "Fern Valley", "Chikanga", "Zimta"],
        fee: 15,
      },
    ],
  },
  {
    city: "Gweru",
    zones: [
      {
        id: "gweru-all",
        name: "Gweru",
        areas: ["Gweru CBD", "Mkoba", "Mambo", "Ridgemont", "Ascot", "Kopje"],
        fee: 12,
      },
    ],
  },
  {
    city: "Masvingo",
    zones: [
      {
        id: "msv-all",
        name: "Masvingo",
        areas: ["Masvingo CBD", "Mucheke", "Rujeko", "Target Kopje", "Beekhee"],
        fee: 15,
      },
    ],
  },
  {
    city: "Kwekwe",
    zones: [
      {
        id: "kwk-all",
        name: "Kwekwe",
        areas: ["Kwekwe CBD", "Mbizo", "Amaveni", "Rimuka"],
        fee: 12,
      },
    ],
  },
  {
    city: "Kadoma",
    zones: [
      {
        id: "kad-all",
        name: "Kadoma",
        areas: ["Kadoma CBD", "Rimuka", "Ngezi"],
        fee: 15,
      },
    ],
  },
  {
    city: "Chinhoyi",
    zones: [
      {
        id: "chi-all",
        name: "Chinhoyi",
        areas: ["Chinhoyi CBD", "Chikonohono"],
        fee: 15,
      },
    ],
  },
];

export const COLLECTION_POINT = {
  name: "MUFASA Gadgets & Accessories",
  address: "Harare, Zimbabwe",
  hours: "Mon – Sat · 8:00 AM – 6:00 PM",
  note: "Bring your order confirmation number",
};

export function getZonesForCity(cityName: string): DeliveryZone[] {
  return DELIVERY_CITIES.find((c) => c.city === cityName)?.zones ?? [];
}

export function getDeliveryFee(cityName: string, zoneId: string): number {
  const zones = getZonesForCity(cityName);
  return zones.find((z) => z.id === zoneId)?.fee ?? 0;
}
