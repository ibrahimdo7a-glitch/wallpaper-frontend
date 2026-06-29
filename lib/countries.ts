/**
 * Geo-targeted landing pages: one per country we serve (Gulf + Jordan + Iraq).
 * `name_ar` MUST match the values stored on listings (MarketListing::COUNTRIES)
 * so the Gulf pages can filter the marketplace by country. Jordan/Iraq have no
 * marketplace listings yet, so their pages lean on brands + news + content.
 */
export interface CountryDef {
  slug: string;       // latin URL slug
  name_ar: string;    // matches the listing country value (Gulf)
  name_en: string;
  gulf: boolean;      // true = has marketplace listings
  intro_ar: string;
  intro_en: string;
}

export const COUNTRIES: CountryDef[] = [
  {
    slug: 'qatar', name_ar: 'قطر', name_en: 'Qatar', gulf: true,
    intro_ar: 'دليلك للسيارات الكهربائية والصينية في قطر: أحدث الموديلات والماركات، أسعار وعروض البيع في الدوحة، الأخبار والمواصفات وكل ما تحتاجه قبل الشراء.',
    intro_en: 'Your guide to electric and Chinese cars in Qatar: latest models and brands, prices and listings in Doha, news, specs and everything you need before buying.',
  },
  {
    slug: 'saudi-arabia', name_ar: 'السعودية', name_en: 'Saudi Arabia', gulf: true,
    intro_ar: 'كل ما يخص السيارات الكهربائية والصينية في السعودية: الموديلات الجديدة، أسعار البيع والعروض في الرياض وجدة والدمام، آخر الأخبار والمواصفات.',
    intro_en: 'Everything about electric and Chinese cars in Saudi Arabia: new models, prices and listings in Riyadh, Jeddah and Dammam, latest news and specs.',
  },
  {
    slug: 'uae', name_ar: 'الإمارات', name_en: 'UAE', gulf: true,
    intro_ar: 'السيارات الكهربائية والصينية في الإمارات: أحدث الماركات والموديلات، إعلانات البيع في دبي وأبوظبي والشارقة، الأسعار والأخبار والمواصفات.',
    intro_en: 'Electric and Chinese cars in the UAE: the newest brands and models, listings in Dubai, Abu Dhabi and Sharjah, prices, news and specs.',
  },
  {
    slug: 'kuwait', name_ar: 'الكويت', name_en: 'Kuwait', gulf: true,
    intro_ar: 'السيارات الكهربائية والصينية في الكويت: الموديلات والماركات، عروض وإعلانات البيع، الأسعار وآخر الأخبار والمواصفات الكاملة.',
    intro_en: 'Electric and Chinese cars in Kuwait: models and brands, deals and listings, prices, latest news and full specs.',
  },
  {
    slug: 'bahrain', name_ar: 'البحرين', name_en: 'Bahrain', gulf: true,
    intro_ar: 'السيارات الكهربائية والصينية في البحرين: أحدث الموديلات، إعلانات البيع في المنامة، الأسعار والأخبار والمواصفات.',
    intro_en: 'Electric and Chinese cars in Bahrain: latest models, listings in Manama, prices, news and specs.',
  },
  {
    slug: 'oman', name_ar: 'عُمان', name_en: 'Oman', gulf: true,
    intro_ar: 'السيارات الكهربائية والصينية في عُمان: الموديلات والماركات، إعلانات البيع في مسقط، الأسعار وآخر الأخبار والمواصفات.',
    intro_en: 'Electric and Chinese cars in Oman: models and brands, listings in Muscat, prices, latest news and specs.',
  },
  {
    slug: 'jordan', name_ar: 'الأردن', name_en: 'Jordan', gulf: false,
    intro_ar: 'السيارات الكهربائية والصينية في الأردن: تعرّف على أحدث الماركات والموديلات الصينية، المواصفات والأسعار التقديرية وآخر الأخبار قبل الشراء في عمّان.',
    intro_en: 'Electric and Chinese cars in Jordan: discover the newest Chinese brands and models, specs, indicative prices and the latest news before buying in Amman.',
  },
  {
    slug: 'iraq', name_ar: 'العراق', name_en: 'Iraq', gulf: false,
    intro_ar: 'السيارات الكهربائية والصينية في العراق: أحدث الماركات والموديلات الصينية، المواصفات والأسعار التقديرية وآخر أخبار السيارات الكهربائية في بغداد وأربيل والبصرة.',
    intro_en: 'Electric and Chinese cars in Iraq: the newest Chinese brands and models, specs, indicative prices and the latest EV news in Baghdad, Erbil and Basra.',
  },
];

export const countryBySlug = (slug: string) => COUNTRIES.find((c) => c.slug === slug);
