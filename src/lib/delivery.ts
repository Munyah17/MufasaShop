export type DeliveryMethod = "delivery" | "collection";

export interface DeliveryArea {
  id: string;
  name: string;
  city: string;
  fee: number; // USD
}

// ─── Zimbabwe Delivery Areas ──────────────────────────────────────────────────
// Harare: InDrive-calibrated intracity rates
// All other cities: $12–$20 intercity (courier-tier)

export const DELIVERY_AREAS: DeliveryArea[] = [
  // ── Harare — CBD ($3) ─────────────────────────────────────────────────────
  { id: "hrr-cbd",           name: "CBD",               city: "Harare", fee: 3 },
  { id: "hrr-avenues",       name: "Avenues",            city: "Harare", fee: 3 },
  { id: "hrr-kopje",         name: "Kopje",              city: "Harare", fee: 3 },
  { id: "hrr-central",       name: "Harare Central",     city: "Harare", fee: 3 },
  { id: "hrr-rezende",       name: "Rezende",            city: "Harare", fee: 3 },
  { id: "hrr-eastlea",       name: "Eastlea",            city: "Harare", fee: 3 },
  { id: "hrr-belgravia",     name: "Belgravia",          city: "Harare", fee: 3 },

  // ── Harare — Inner North ($4) ──────────────────────────────────────────────
  { id: "hrr-avondale",      name: "Avondale",           city: "Harare", fee: 4 },
  { id: "hrr-avondale-w",    name: "Avondale West",      city: "Harare", fee: 4 },
  { id: "hrr-meyrick",       name: "Meyrick Park",       city: "Harare", fee: 4 },
  { id: "hrr-alex-park",     name: "Alexander Park",     city: "Harare", fee: 4 },
  { id: "hrr-strathaven",    name: "Strathaven",         city: "Harare", fee: 4 },
  { id: "hrr-newlands",      name: "Newlands",           city: "Harare", fee: 4 },
  { id: "hrr-emerald",       name: "Emerald Hill",       city: "Harare", fee: 4 },
  { id: "hrr-highlands",     name: "Highlands",          city: "Harare", fee: 4 },
  { id: "hrr-milton-park",   name: "Milton Park",        city: "Harare", fee: 4 },
  { id: "hrr-chisipite",     name: "Chisipite",          city: "Harare", fee: 4 },
  { id: "hrr-belvedere",     name: "Belvedere",          city: "Harare", fee: 4 },

  // ── Harare — Northern Suburbs ($5) ────────────────────────────────────────
  { id: "hrr-borrowdale",    name: "Borrowdale",         city: "Harare", fee: 5 },
  { id: "hrr-brk-brooke",    name: "Borrowdale Brooke",  city: "Harare", fee: 5 },
  { id: "hrr-mt-pleasant",   name: "Mount Pleasant",     city: "Harare", fee: 5 },
  { id: "hrr-mt-pl-hts",     name: "Mount Pleasant Heights", city: "Harare", fee: 5 },
  { id: "hrr-glen-lorne",    name: "Glen Lorne",         city: "Harare", fee: 5 },
  { id: "hrr-mandara",       name: "Mandara",            city: "Harare", fee: 5 },
  { id: "hrr-colne",         name: "Colne Valley",       city: "Harare", fee: 5 },
  { id: "hrr-greendale",     name: "Greendale",          city: "Harare", fee: 5 },
  { id: "hrr-msasa",         name: "Msasa",              city: "Harare", fee: 5 },
  { id: "hrr-msasa-park",    name: "Msasa Park",         city: "Harare", fee: 5 },
  { id: "hrr-umwins",        name: "Umwinsidale",        city: "Harare", fee: 5 },
  { id: "hrr-kamfinsa",      name: "Kamfinsa",           city: "Harare", fee: 5 },

  // ── Harare — Western Suburbs ($5) ─────────────────────────────────────────
  { id: "hrr-mabelreign",    name: "Mabelreign",         city: "Harare", fee: 5 },
  { id: "hrr-marlborough",   name: "Marlborough",        city: "Harare", fee: 5 },
  { id: "hrr-westgate",      name: "Westgate",           city: "Harare", fee: 5 },
  { id: "hrr-warren-park",   name: "Warren Park",        city: "Harare", fee: 5 },
  { id: "hrr-warren-d",      name: "Warren Park D",      city: "Harare", fee: 5 },
  { id: "hrr-braeside",      name: "Braeside",           city: "Harare", fee: 5 },
  { id: "hrr-rugare",        name: "Rugare",             city: "Harare", fee: 5 },

  // ── Harare — Eastern Suburbs ($5) ─────────────────────────────────────────
  { id: "hrr-hatfield",      name: "Hatfield",           city: "Harare", fee: 5 },
  { id: "hrr-waterfalls",    name: "Waterfalls",         city: "Harare", fee: 5 },
  { id: "hrr-prospect",      name: "Prospect",           city: "Harare", fee: 5 },
  { id: "hrr-cranborne",     name: "Cranborne",          city: "Harare", fee: 5 },
  { id: "hrr-ardbennie",     name: "Ardbennie",          city: "Harare", fee: 5 },
  { id: "hrr-willowvale",    name: "Willowvale",         city: "Harare", fee: 5 },
  { id: "hrr-southerton",    name: "Southerton",         city: "Harare", fee: 5 },
  { id: "hrr-graniteside",   name: "Graniteside",        city: "Harare", fee: 5 },
  { id: "hrr-workington",    name: "Workington",         city: "Harare", fee: 5 },
  { id: "hrr-marimba",       name: "Marimba",            city: "Harare", fee: 5 },

  // ── Harare — Southern Suburbs ($5) ────────────────────────────────────────
  { id: "hrr-highfield",     name: "Highfield",          city: "Harare", fee: 5 },
  { id: "hrr-glen-norah",    name: "Glen Norah",         city: "Harare", fee: 5 },
  { id: "hrr-glen-view",     name: "Glen View",          city: "Harare", fee: 5 },
  { id: "hrr-budiriro",      name: "Budiriro",           city: "Harare", fee: 5 },
  { id: "hrr-mufakose",      name: "Mufakose",           city: "Harare", fee: 5 },
  { id: "hrr-kambuzuma",     name: "Kambuzuma",          city: "Harare", fee: 5 },
  { id: "hrr-sunningdale",   name: "Sunningdale",        city: "Harare", fee: 5 },
  { id: "hrr-mbare",         name: "Mbare",              city: "Harare", fee: 5 },

  // ── Harare — Far Suburbs ($7) ──────────────────────────────────────────────
  { id: "hrr-dzivarasekwa",  name: "Dzivarasekwa",       city: "Harare", fee: 7 },
  { id: "hrr-kuwadzana",     name: "Kuwadzana",          city: "Harare", fee: 7 },
  { id: "hrr-hatcliffe",     name: "Hatcliffe",          city: "Harare", fee: 7 },
  { id: "hrr-mabvuku",       name: "Mabvuku",            city: "Harare", fee: 7 },
  { id: "hrr-tafara",        name: "Tafara",             city: "Harare", fee: 7 },
  { id: "hrr-caledonia",     name: "Caledonia",          city: "Harare", fee: 7 },
  { id: "hrr-zimre-park",    name: "Zimre Park",         city: "Harare", fee: 7 },

  // ── Greater Harare ($10) ───────────────────────────────────────────────────
  { id: "hrr-unit-a",        name: "Unit A (Chitungwiza)",    city: "Harare", fee: 10 },
  { id: "hrr-unit-b",        name: "Unit B (Chitungwiza)",    city: "Harare", fee: 10 },
  { id: "hrr-unit-c",        name: "Unit C (Chitungwiza)",    city: "Harare", fee: 10 },
  { id: "hrr-unit-d",        name: "Unit D (Chitungwiza)",    city: "Harare", fee: 10 },
  { id: "hrr-zengeza",       name: "Zengeza (Chitungwiza)",   city: "Harare", fee: 10 },
  { id: "hrr-st-marys",      name: "St Mary's (Chitungwiza)", city: "Harare", fee: 10 },
  { id: "hrr-ruwa",          name: "Ruwa",               city: "Harare", fee: 10 },
  { id: "hrr-norton",        name: "Norton",             city: "Harare", fee: 10 },
  { id: "hrr-epworth",       name: "Epworth",            city: "Harare", fee: 10 },
  { id: "hrr-seke",          name: "Seke",               city: "Harare", fee: 10 },
  { id: "hrr-domboshava",    name: "Domboshava",         city: "Harare", fee: 10 },

  // ── Bulawayo — City / North ($12) ─────────────────────────────────────────
  { id: "byo-cbd",           name: "Bulawayo CBD",       city: "Bulawayo", fee: 12 },
  { id: "byo-suburbs",       name: "Suburbs",            city: "Bulawayo", fee: 12 },
  { id: "byo-hillside",      name: "Hillside",           city: "Bulawayo", fee: 12 },
  { id: "byo-burnside",      name: "Burnside",           city: "Bulawayo", fee: 12 },
  { id: "byo-matshe",        name: "Matsheumhlope",      city: "Bulawayo", fee: 12 },
  { id: "byo-queens",        name: "Queens Park",        city: "Bulawayo", fee: 12 },
  { id: "byo-selbourne",     name: "Selbourne Park",     city: "Bulawayo", fee: 12 },
  { id: "byo-famona",        name: "Famona",             city: "Bulawayo", fee: 12 },
  { id: "byo-paddon",        name: "Paddonhurst",        city: "Bulawayo", fee: 12 },
  { id: "byo-barham",        name: "Barham Green",       city: "Bulawayo", fee: 12 },
  { id: "byo-khumalo",       name: "Khumalo",            city: "Bulawayo", fee: 12 },
  { id: "byo-richmond",      name: "Richmond",           city: "Bulawayo", fee: 12 },
  { id: "byo-northend",      name: "Northend",           city: "Bulawayo", fee: 12 },
  { id: "byo-riverside",     name: "Riverside",          city: "Bulawayo", fee: 12 },
  { id: "byo-waterford",     name: "Waterford",          city: "Bulawayo", fee: 12 },
  { id: "byo-hyde-park",     name: "Hyde Park",          city: "Bulawayo", fee: 12 },
  { id: "byo-raylton",       name: "Raylton",            city: "Bulawayo", fee: 12 },
  { id: "byo-steeldale",     name: "Steeldale",          city: "Bulawayo", fee: 12 },

  // ── Bulawayo — Outer ($15) ─────────────────────────────────────────────────
  { id: "byo-luveve",        name: "Luveve",             city: "Bulawayo", fee: 15 },
  { id: "byo-nkulumane",     name: "Nkulumane",          city: "Bulawayo", fee: 15 },
  { id: "byo-pumula",        name: "Pumula",             city: "Bulawayo", fee: 15 },
  { id: "byo-cowdray",       name: "Cowdray Park",       city: "Bulawayo", fee: 15 },
  { id: "byo-entumbane",     name: "Entumbane",          city: "Bulawayo", fee: 15 },
  { id: "byo-lobengula",     name: "Lobengula",          city: "Bulawayo", fee: 15 },
  { id: "byo-njube",         name: "Njube",              city: "Bulawayo", fee: 15 },
  { id: "byo-makokoba",      name: "Makokoba",           city: "Bulawayo", fee: 15 },
  { id: "byo-mzilikazi",     name: "Mzilikazi",          city: "Bulawayo", fee: 15 },
  { id: "byo-mpopoma",       name: "Mpopoma",            city: "Bulawayo", fee: 15 },
  { id: "byo-emganwini",     name: "Emganwini",          city: "Bulawayo", fee: 15 },
  { id: "byo-tshabalala",    name: "Tshabalala",         city: "Bulawayo", fee: 15 },
  { id: "byo-barbour",       name: "Barbourfields",      city: "Bulawayo", fee: 15 },
  { id: "byo-bellevue",      name: "Bellevue",           city: "Bulawayo", fee: 15 },
  { id: "byo-mabutweni",     name: "Mabutweni",          city: "Bulawayo", fee: 15 },
  { id: "byo-iminyela",      name: "Iminyela",           city: "Bulawayo", fee: 15 },
  { id: "byo-sizinda",       name: "Sizinda",            city: "Bulawayo", fee: 15 },
  { id: "byo-magwegwe",      name: "Magwegwe",           city: "Bulawayo", fee: 15 },

  // ── Mutare ($12 / $15) ─────────────────────────────────────────────────────
  { id: "mut-cbd",           name: "Mutare CBD",         city: "Mutare", fee: 12 },
  { id: "mut-sakubva",       name: "Sakubva",            city: "Mutare", fee: 12 },
  { id: "mut-dangamvura",    name: "Dangamvura",         city: "Mutare", fee: 12 },
  { id: "mut-hobhouse",      name: "Hobhouse",           city: "Mutare", fee: 12 },
  { id: "mut-fern-valley",   name: "Fern Valley",        city: "Mutare", fee: 12 },
  { id: "mut-chikanga",      name: "Chikanga",           city: "Mutare", fee: 12 },
  { id: "mut-yeovil",        name: "Yeovil",             city: "Mutare", fee: 12 },
  { id: "mut-greenside",     name: "Greenside",          city: "Mutare", fee: 12 },
  { id: "mut-fairbridge",    name: "Fairbridge Park",    city: "Mutare", fee: 12 },
  { id: "mut-alicedale",     name: "Alicedale",          city: "Mutare", fee: 12 },
  { id: "mut-murambi",       name: "Murambi",            city: "Mutare", fee: 15 },
  { id: "mut-zimta",         name: "Zimta",              city: "Mutare", fee: 15 },

  // ── Gweru ($12) ────────────────────────────────────────────────────────────
  { id: "gweru-cbd",         name: "Gweru CBD",          city: "Gweru", fee: 12 },
  { id: "gweru-mkoba",       name: "Mkoba",              city: "Gweru", fee: 12 },
  { id: "gweru-mambo",       name: "Mambo",              city: "Gweru", fee: 12 },
  { id: "gweru-ridgemont",   name: "Ridgemont",          city: "Gweru", fee: 12 },
  { id: "gweru-ascot",       name: "Ascot",              city: "Gweru", fee: 12 },
  { id: "gweru-senga",       name: "Senga",              city: "Gweru", fee: 12 },
  { id: "gweru-woodlands",   name: "Woodlands",          city: "Gweru", fee: 12 },
  { id: "gweru-riverside",   name: "Riverside",          city: "Gweru", fee: 12 },
  { id: "gweru-nehanda",     name: "Nehanda",            city: "Gweru", fee: 12 },

  // ── Masvingo ($15) ─────────────────────────────────────────────────────────
  { id: "msv-cbd",           name: "Masvingo CBD",       city: "Masvingo", fee: 15 },
  { id: "msv-mucheke",       name: "Mucheke",            city: "Masvingo", fee: 15 },
  { id: "msv-rujeko",        name: "Rujeko",             city: "Masvingo", fee: 15 },
  { id: "msv-kopje",         name: "Target Kopje",       city: "Masvingo", fee: 15 },
  { id: "msv-rhodene",       name: "Rhodene",            city: "Masvingo", fee: 15 },
  { id: "msv-makwasha",      name: "Makwasha",           city: "Masvingo", fee: 15 },

  // ── Kwekwe ($12) ───────────────────────────────────────────────────────────
  { id: "kwk-cbd",           name: "Kwekwe CBD",         city: "Kwekwe", fee: 12 },
  { id: "kwk-mbizo",         name: "Mbizo",              city: "Kwekwe", fee: 12 },
  { id: "kwk-amaveni",       name: "Amaveni",            city: "Kwekwe", fee: 12 },
  { id: "kwk-rimuka",        name: "Rimuka",             city: "Kwekwe", fee: 12 },
  { id: "kwk-newtown",       name: "Newtown",            city: "Kwekwe", fee: 12 },

  // ── Kadoma ($12) ───────────────────────────────────────────────────────────
  { id: "kad-cbd",           name: "Kadoma CBD",         city: "Kadoma", fee: 12 },
  { id: "kad-rimuka",        name: "Rimuka",             city: "Kadoma", fee: 12 },

  // ── Chinhoyi ($12) ─────────────────────────────────────────────────────────
  { id: "chi-cbd",           name: "Chinhoyi CBD",       city: "Chinhoyi", fee: 12 },
  { id: "chi-chikonohono",   name: "Chikonohono",        city: "Chinhoyi", fee: 12 },

  // ── Bindura ($15) ──────────────────────────────────────────────────────────
  { id: "bin-cbd",           name: "Bindura CBD",        city: "Bindura", fee: 15 },
  { id: "bin-chipadze",      name: "Chipadze",           city: "Bindura", fee: 15 },
  { id: "bin-chiwaridzo",    name: "Chiwaridzo",         city: "Bindura", fee: 15 },

  // ── Zvishavane ($15) ───────────────────────────────────────────────────────
  { id: "zvi-cbd",           name: "Zvishavane CBD",     city: "Zvishavane", fee: 15 },
  { id: "zvi-mandava",       name: "Mandava",            city: "Zvishavane", fee: 15 },

  // ── Chegutu ($15) ──────────────────────────────────────────────────────────
  { id: "che-cbd",           name: "Chegutu CBD",        city: "Chegutu", fee: 15 },
  { id: "che-west",          name: "Chegutu West",       city: "Chegutu", fee: 15 },

  // ── Redcliff ($12) ─────────────────────────────────────────────────────────
  { id: "red-cbd",           name: "Redcliff CBD",       city: "Redcliff", fee: 12 },

  // ── Shurugwi ($15) ─────────────────────────────────────────────────────────
  { id: "shu-cbd",           name: "Shurugwi CBD",       city: "Shurugwi", fee: 15 },

  // ── Victoria Falls ($18) ───────────────────────────────────────────────────
  { id: "vfa-cbd",           name: "Victoria Falls CBD", city: "Victoria Falls", fee: 18 },
  { id: "vfa-chinotimba",    name: "Chinotimba",         city: "Victoria Falls", fee: 18 },

  // ── Kariba ($18) ───────────────────────────────────────────────────────────
  { id: "kar-cbd",           name: "Kariba CBD",         city: "Kariba", fee: 18 },
  { id: "kar-mahombe",       name: "Mahombekombe",       city: "Kariba", fee: 18 },
  { id: "kar-nyamhunga",     name: "Nyamhunga",          city: "Kariba", fee: 18 },

  // ── Hwange ($18) ───────────────────────────────────────────────────────────
  { id: "hwa-cbd",           name: "Hwange CBD",         city: "Hwange", fee: 18 },
  { id: "hwa-colliery",      name: "Hwange Colliery",    city: "Hwange", fee: 18 },

  // ── Chipinge ($18) ─────────────────────────────────────────────────────────
  { id: "cpi-cbd",           name: "Chipinge CBD",       city: "Chipinge", fee: 18 },

  // ── Chiredzi ($18) ─────────────────────────────────────────────────────────
  { id: "cri-cbd",           name: "Chiredzi CBD",       city: "Chiredzi", fee: 18 },
  { id: "cri-triangle",      name: "Triangle",           city: "Chiredzi", fee: 18 },

  // ── Beitbridge ($20) ───────────────────────────────────────────────────────
  { id: "bbt-cbd",           name: "Beitbridge CBD",     city: "Beitbridge", fee: 20 },
];

export const DELIVERY_CITIES = [...new Set(DELIVERY_AREAS.map((a) => a.city))];

export const COLLECTION_POINT = {
  name: "MUFASA Gadgets & Accessories",
  address: "Harare, Zimbabwe",
  hours: "Mon – Sat · 8:00 AM – 6:00 PM",
  note: "Bring your order confirmation number",
};

export function getAreasForCity(city: string): DeliveryArea[] {
  return DELIVERY_AREAS.filter((a) => a.city === city);
}

export function searchAreas(city: string, query: string): DeliveryArea[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();
  return DELIVERY_AREAS.filter(
    (a) => a.city === city && a.name.toLowerCase().includes(q)
  ).slice(0, 10);
}

export function getAreaById(id: string): DeliveryArea | undefined {
  return DELIVERY_AREAS.find((a) => a.id === id);
}
