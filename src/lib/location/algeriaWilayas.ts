import { Locale } from '@/types';

export interface Wilaya {
  code: number;
  nameFr: string;
  nameAr: string;
  nameEn: string;
}

export interface Country {
  code: string;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  dialCode: string;
  isDefault?: boolean;
}

export const SUPPORTED_COUNTRIES: Country[] = [
  { code: 'DZ', nameEn: 'Algeria', nameFr: 'Algérie', nameAr: 'الجزائر', dialCode: '+213', isDefault: true },
  { code: 'FR', nameEn: 'France', nameFr: 'France', nameAr: 'فرنسا', dialCode: '+33' },
  { code: 'TN', nameEn: 'Tunisia', nameFr: 'Tunisie', nameAr: 'تونس', dialCode: '+216' },
  { code: 'MA', nameEn: 'Morocco', nameFr: 'Maroc', nameAr: 'المغرب', dialCode: '+212' },
  { code: 'AE', nameEn: 'United Arab Emirates', nameFr: 'Émirats arabes unis', nameAr: 'الإمارات العربية المتحدة', dialCode: '+971' },
  { code: 'SA', nameEn: 'Saudi Arabia', nameFr: 'Arabie saoudite', nameAr: 'المملكة العربية السعودية', dialCode: '+966' },
  { code: 'GB', nameEn: 'United Kingdom', nameFr: 'Royaume-Uni', nameAr: 'المملكة المتحدة', dialCode: '+44' },
  { code: 'CA', nameEn: 'Canada', nameFr: 'Canada', nameAr: 'كندا', dialCode: '+1' },
  { code: 'US', nameEn: 'United States', nameFr: 'États-Unis', nameAr: 'الولايات المتحدة', dialCode: '+1' },
  { code: 'CH', nameEn: 'Switzerland', nameFr: 'Suisse', nameAr: 'سويسرا', dialCode: '+41' },
  { code: 'BE', nameEn: 'Belgium', nameFr: 'Belgique', nameAr: 'بلجيكا', dialCode: '+32' },
  { code: 'DE', nameEn: 'Germany', nameFr: 'Allemagne', nameAr: 'ألمانيا', dialCode: '+49' },
  { code: 'QA', nameEn: 'Qatar', nameFr: 'Qatar', nameAr: 'قطر', dialCode: '+974' },
  { code: 'KW', nameEn: 'Kuwait', nameFr: 'Koweït', nameAr: 'الكويت', dialCode: '+965' },
];

export const ALGERIA_WILAYAS: Wilaya[] = [
  { code: 1, nameFr: 'Adrar', nameAr: 'أدرار', nameEn: 'Adrar' },
  { code: 2, nameFr: 'Chlef', nameAr: 'الشلف', nameEn: 'Chlef' },
  { code: 3, nameFr: 'Laghouat', nameAr: 'الأغواط', nameEn: 'Laghouat' },
  { code: 4, nameFr: 'Oum El Bouaghi', nameAr: 'أم البواقي', nameEn: 'Oum El Bouaghi' },
  { code: 5, nameFr: 'Batna', nameAr: 'باتنة', nameEn: 'Batna' },
  { code: 6, nameFr: 'Béjaïa', nameAr: 'بجاية', nameEn: 'Bejaia' },
  { code: 7, nameFr: 'Biskra', nameAr: 'بسكرة', nameEn: 'Biskra' },
  { code: 8, nameFr: 'Béchar', nameAr: 'بشار', nameEn: 'Bechar' },
  { code: 9, nameFr: 'Blida', nameAr: 'البليدة', nameEn: 'Blida' },
  { code: 10, nameFr: 'Bouira', nameAr: 'البويرة', nameEn: 'Bouira' },
  { code: 11, nameFr: 'Tamanrasset', nameAr: 'تمنراست', nameEn: 'Tamanrasset' },
  { code: 12, nameFr: 'Tébessa', nameAr: 'تبسة', nameEn: 'Tebessa' },
  { code: 13, nameFr: 'Tlemcen', nameAr: 'تلمسان', nameEn: 'Tlemcen' },
  { code: 14, nameFr: 'Tiaret', nameAr: 'تيارت', nameEn: 'Tiaret' },
  { code: 15, nameFr: 'Tizi Ouzou', nameAr: 'تيزي وزو', nameEn: 'Tizi Ouzou' },
  { code: 16, nameFr: 'Alger', nameAr: 'الجزائر', nameEn: 'Algiers' },
  { code: 17, nameFr: 'Djelfa', nameAr: 'الجلفة', nameEn: 'Djelfa' },
  { code: 18, nameFr: 'Jijel', nameAr: 'جيجل', nameEn: 'Jijel' },
  { code: 19, nameFr: 'Sétif', nameAr: 'سطيف', nameEn: 'Setif' },
  { code: 20, nameFr: 'Saïda', nameAr: 'سعيدة', nameEn: 'Saida' },
  { code: 21, nameFr: 'Skikda', nameAr: 'سكيكدة', nameEn: 'Skikda' },
  { code: 22, nameFr: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', nameEn: 'Sidi Bel Abbes' },
  { code: 23, nameFr: 'Annaba', nameAr: 'عنابة', nameEn: 'Annaba' },
  { code: 24, nameFr: 'Guelma', nameAr: 'قالمة', nameEn: 'Guelma' },
  { code: 25, nameFr: 'Constantine', nameAr: 'قسنطينة', nameEn: 'Constantine' },
  { code: 26, nameFr: 'Médéa', nameAr: 'المدية', nameEn: 'Medea' },
  { code: 27, nameFr: 'Mostaganem', nameAr: 'مستغانم', nameEn: 'Mostaganem' },
  { code: 28, nameFr: "M'Sila", nameAr: 'المسيلة', nameEn: "M'Sila" },
  { code: 29, nameFr: 'Mascara', nameAr: 'معسكر', nameEn: 'Mascara' },
  { code: 30, nameFr: 'Ouargla', nameAr: 'ورقلة', nameEn: 'Ouargla' },
  { code: 31, nameFr: 'Oran', nameAr: 'وهران', nameEn: 'Oran' },
  { code: 32, nameFr: 'El Bayadh', nameAr: 'البيض', nameEn: 'El Bayadh' },
  { code: 33, nameFr: 'Illizi', nameAr: 'إليزي', nameEn: 'Illizi' },
  { code: 34, nameFr: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج', nameEn: 'Bordj Bou Arreridj' },
  { code: 35, nameFr: 'Boumerdès', nameAr: 'بومرداس', nameEn: 'Boumerdes' },
  { code: 36, nameFr: 'El Tarf', nameAr: 'الطارف', nameEn: 'El Tarf' },
  { code: 37, nameFr: 'Tindouf', nameAr: 'تندوف', nameEn: 'Tindouf' },
  { code: 38, nameFr: 'Tissemsilt', nameAr: 'تيسمسيلت', nameEn: 'Tissemsilt' },
  { code: 39, nameFr: 'El Oued', nameAr: 'الوادي', nameEn: 'El Oued' },
  { code: 40, nameFr: 'Khenchela', nameAr: 'خنشلة', nameEn: 'Khenchela' },
  { code: 41, nameFr: 'Souk Ahras', nameAr: 'سوق أهراس', nameEn: 'Souk Ahras' },
  { code: 42, nameFr: 'Tipaza', nameAr: 'تيبازة', nameEn: 'Tipaza' },
  { code: 43, nameFr: 'Mila', nameAr: 'ميلة', nameEn: 'Mila' },
  { code: 44, nameFr: 'Aïn Defla', nameAr: 'عين الدفلى', nameEn: 'Ain Defla' },
  { code: 45, nameFr: 'Naâma', nameAr: 'النعامة', nameEn: 'Naama' },
  { code: 46, nameFr: 'Aïn Témouchent', nameAr: 'عين تموشنت', nameEn: 'Ain Temouchent' },
  { code: 47, nameFr: 'Ghardaïa', nameAr: 'غرداية', nameEn: 'Ghardaia' },
  { code: 48, nameFr: 'Relizane', nameAr: 'غليزان', nameEn: 'Relizane' },
  { code: 49, nameFr: 'Timimoun', nameAr: 'تيميمون', nameEn: 'Timimoun' },
  { code: 50, nameFr: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار', nameEn: 'Bordj Badji Mokhtar' },
  { code: 51, nameFr: 'Ouled Djellal', nameAr: 'أولاد جلال', nameEn: 'Ouled Djellal' },
  { code: 52, nameFr: 'Béni Abbès', nameAr: 'بني عباس', nameEn: 'Beni Abbes' },
  { code: 53, nameFr: 'In Salah', nameAr: 'عين صالح', nameEn: 'In Salah' },
  { code: 54, nameFr: 'In Guezzam', nameAr: 'عين قزام', nameEn: 'In Guezzam' },
  { code: 55, nameFr: 'Touggourt', nameAr: 'تقرت', nameEn: 'Touggourt' },
  { code: 56, nameFr: 'Djanet', nameAr: 'جانت', nameEn: 'Djanet' },
  { code: 57, nameFr: "El M'Ghair", nameAr: 'المغير', nameEn: "El M'Ghair" },
  { code: 58, nameFr: 'El Meniaa', nameAr: 'المنيعة', nameEn: 'El Meniaa' },
];

export function isAlgeria(countryNameOrCode?: string): boolean {
  if (!countryNameOrCode) return false;
  const s = countryNameOrCode.trim().toLowerCase();
  return (
    s === 'dz' ||
    s === 'algeria' ||
    s === 'algérie' ||
    s === 'algerie' ||
    s === 'الجزائر'
  );
}

export function formatWilayaDisplay(w: Wilaya, locale: Locale = 'en'): string {
  const codePadded = String(w.code).padStart(2, '0');
  if (locale === 'ar') {
    return `${codePadded} - ${w.nameAr}`;
  } else if (locale === 'fr') {
    return `${codePadded} - ${w.nameFr}`;
  }
  return `${codePadded} - ${w.nameEn}`;
}

export function findWilayaByCode(code: number | string): Wilaya | undefined {
  const num = typeof code === 'number' ? code : parseInt(code, 10);
  return ALGERIA_WILAYAS.find((w) => w.code === num);
}

export function findWilayaByName(name: string): Wilaya | undefined {
  const s = name.trim().toLowerCase();
  return ALGERIA_WILAYAS.find(
    (w) =>
      w.nameFr.toLowerCase() === s ||
      w.nameAr.toLowerCase() === s ||
      w.nameEn.toLowerCase() === s
  );
}
