import { DonationCategory } from '../types';

export interface CancerHospital {
  id: string;
  name: string;
  shortName: string;
  city: string;
  stateOrProvince?: string;
  country: string;
  region: 'north_america' | 'europe' | 'asia_pacific' | 'latin_america' | 'middle_east_africa';
  latitude: number;
  longitude: number;
  // Normalized world coordinates (x: 0-100%, y: 0-100%) for Equirectangular SVG projection
  worldCoords: { x: number; y: number };
  oncologySpecialties: string[];
  categories: DonationCategory[];
  accreditations: string;
  globalRanking: string;
  phone: string;
  emergencyTransplantDesk: string;
  annualPatients: string;
  boneMarrowBeds: number;
  bloodBankCapacity: string;
  pediatricWigGuildAffiliation: string;
  clinicalTrialsCount: number;
  overview: string;
  colorTheme: string;
  isVerified: boolean;
  googleMapsPlaceId?: string;
  websiteUrl?: string;
  portalName?: string;
}

export function getCancerHospitalPortalName(hospital: CancerHospital | { name: string; shortName?: string; portalName?: string }): string {
  if ('portalName' in hospital && hospital.portalName) {
    return hospital.portalName;
  }
  const cleanName = hospital.shortName || hospital.name;
  if (/portal/i.test(cleanName)) return cleanName;
  return `${cleanName} Hospital Portal`;
}

export function formatHospitalPortalNameFromQuery(query: string, matchedHospital?: CancerHospital | null): string {
  if (matchedHospital) {
    return matchedHospital.portalName || `${matchedHospital.shortName || matchedHospital.name} Hospital Portal`;
  }
  const trimmed = query.trim();
  if (!trimmed) {
    return 'Clinical Hospital Portal';
  }
  if (/portal/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} Hospital Portal`;
}

export const WORLD_CANCER_HOSPITALS: CancerHospital[] = [
  {
    id: 'ch_md_anderson',
    name: 'MD Anderson Cancer Center (University of Texas)',
    shortName: 'MD Anderson',
    city: 'Houston',
    stateOrProvince: 'TX',
    country: 'United States',
    region: 'north_america',
    latitude: 29.7071,
    longitude: -95.3972,
    worldCoords: { x: 23.5, y: 33.5 },
    oncologySpecialties: [
      'Leukemia & Stem Cell Transplantation',
      'CAR-T Cellular Immunotherapy',
      'Apheresis Platelet Depot',
      'Pediatric Oncology & Cranial Wigs',
      'Surgical Oncology'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'NCI-Designated Comprehensive Cancer Center · FACT / JACIE Accredited',
    globalRanking: '#1 Ranked Cancer Hospital in USA (U.S. News)',
    phone: '+1 (713) 792-6161',
    emergencyTransplantDesk: '+1 (800) 392-1611',
    annualPatients: '174,000+ Cancer Patients',
    boneMarrowBeds: 54,
    bloodBankCapacity: '8,500 apheresis units/mo',
    pediatricWigGuildAffiliation: 'Children’s Cancer Wig Workshop Partner',
    clinicalTrialsCount: 1600,
    overview: 'World-renowned oncology leader pioneering allogeneic bone marrow transplantation, donor apheresis protocols, and pediatric oncology rehabilitation.',
    colorTheme: '#e11d48',
    isVerified: true,
    websiteUrl: 'https://www.mdanderson.org'
  },
  {
    id: 'ch_mskcc',
    name: 'Memorial Sloan Kettering Cancer Center (MSKCC)',
    shortName: 'MSKCC New York',
    city: 'New York',
    stateOrProvince: 'NY',
    country: 'United States',
    region: 'north_america',
    latitude: 40.7641,
    longitude: -73.9566,
    worldCoords: { x: 29.4, y: 27.4 },
    oncologySpecialties: [
      'Pediatric Sarcoma & Leukemia',
      'Allogeneic Stem Cell Bank',
      'Whole Blood & Platelet Apheresis',
      'Hair Donation & Cranial Prosthetics',
      'Thoracic Surgical Oncology'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'NCI Comprehensive Cancer Center · AABB Certified Blood Bank',
    globalRanking: 'Top 2 Ranked Oncology Center Globally',
    phone: '+1 (212) 639-2000',
    emergencyTransplantDesk: '+1 (800) 525-2225',
    annualPatients: '150,000+ Patients',
    boneMarrowBeds: 48,
    bloodBankCapacity: '6,200 units/mo',
    pediatricWigGuildAffiliation: 'Locks for MSK Kids Foundation',
    clinicalTrialsCount: 1200,
    overview: 'Oldest and largest private cancer center in the world, dedicated to compassionate pediatric care, advanced cellular engineering, and patient advocacy.',
    colorTheme: '#0284c7',
    isVerified: true,
    websiteUrl: 'https://www.mskcc.org'
  },
  {
    id: 'ch_mayo_clinic',
    name: 'Mayo Clinic Comprehensive Cancer Center',
    shortName: 'Mayo Clinic Cancer',
    city: 'Rochester',
    stateOrProvince: 'MN',
    country: 'United States',
    region: 'north_america',
    latitude: 44.0225,
    longitude: -92.4668,
    worldCoords: { x: 24.3, y: 25.5 },
    oncologySpecialties: [
      'Living Donor Kidney/Liver Oncology',
      'Bone Marrow Harvest Unit',
      'Apheresis Depot',
      'Clinical Genomics'
    ],
    categories: ['blood', 'organ', 'bone_tissue'],
    accreditations: 'UNOS Member Transplant Center · NCI-Designated',
    globalRanking: '#1 Best Hospital Honor Roll (World Report)',
    phone: '+1 (507) 284-2511',
    emergencyTransplantDesk: '+1 (800) 533-1564',
    annualPatients: '130,000+ Patients',
    boneMarrowBeds: 40,
    bloodBankCapacity: '5,000 units/mo',
    pediatricWigGuildAffiliation: 'Mayo Patient Oncology Support Guild',
    clinicalTrialsCount: 950,
    overview: 'Integrated multi-site oncology center known for living-donor solid organ transplants for oncology patients and complex hematologic stem cell grafts.',
    colorTheme: '#0d9488',
    isVerified: true,
    websiteUrl: 'https://www.mayoclinic.org'
  },
  {
    id: 'ch_dana_farber',
    name: 'Dana-Farber Cancer Institute (Harvard Medical School)',
    shortName: 'Dana-Farber',
    city: 'Boston',
    stateOrProvince: 'MA',
    country: 'United States',
    region: 'north_america',
    latitude: 42.3382,
    longitude: -71.1072,
    worldCoords: { x: 30.2, y: 26.5 },
    oncologySpecialties: [
      'Pediatric Hematologic Malignancies',
      'Cord Blood & HLA Cryobank',
      'Hair Donations for Young Warriors',
      'Blood Transfusion Support'
    ],
    categories: ['blood', 'bone_tissue', 'hair'],
    accreditations: 'NCI Comprehensive Cancer Center · NMDP Donor Center',
    globalRanking: '#1 Pediatric Cancer Center (U.S. News)',
    phone: '+1 (617) 632-3000',
    emergencyTransplantDesk: '+1 (866) 408-3324',
    annualPatients: '85,000+ Patients',
    boneMarrowBeds: 36,
    bloodBankCapacity: '4,500 units/mo',
    pediatricWigGuildAffiliation: 'Jimmy Fund Cranial Prosthetics Guild',
    clinicalTrialsCount: 1100,
    overview: 'Harvard teaching affiliate with legendary pediatric hematology and oncology units, pioneering national bone marrow registry drives and patient wigs.',
    colorTheme: '#6366f1',
    isVerified: true,
    websiteUrl: 'https://www.dana-farber.org'
  },
  {
    id: 'ch_princess_margaret',
    name: 'Princess Margaret Cancer Centre (UHN Toronto)',
    shortName: 'Princess Margaret',
    city: 'Toronto',
    stateOrProvince: 'ON',
    country: 'Canada',
    region: 'north_america',
    latitude: 43.6586,
    longitude: -79.3905,
    worldCoords: { x: 27.9, y: 25.8 },
    oncologySpecialties: [
      'Allogeneic Stem Cell Transplantation',
      'Apheresis Blood Collection',
      'Head & Neck Oncology Wigs',
      'Surgical Liver/Lung Oncology'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'Accreditation Canada · FACT Accredited Blood & Marrow Transplant',
    globalRanking: 'Top 5 Comprehensive Cancer Centers Worldwide',
    phone: '+1 (416) 946-4501',
    emergencyTransplantDesk: '+1 (416) 946-2000',
    annualPatients: '92,000+ Patients',
    boneMarrowBeds: 32,
    bloodBankCapacity: '3,800 units/mo',
    pediatricWigGuildAffiliation: 'Canadian Cancer Prosthetics Network',
    clinicalTrialsCount: 650,
    overview: 'Largest cancer hospital in Canada with one of the most active unrelated-donor bone marrow transplant and apheresis programs in North America.',
    colorTheme: '#059669',
    isVerified: true,
    websiteUrl: 'https://www.uhn.ca/PrincessMargaret'
  },
  {
    id: 'ch_gustave_roussy',
    name: 'Gustave Roussy Cancer Campus Grand Paris',
    shortName: 'Gustave Roussy',
    city: 'Villejuif (Paris)',
    country: 'France',
    region: 'europe',
    latitude: 48.7947,
    longitude: 2.3486,
    worldCoords: { x: 50.6, y: 22.9 },
    oncologySpecialties: [
      'Pediatric Oncology & Rare Tumors',
      'European Bone Marrow Donor Network',
      'Clinical Immunotherapy',
      'Apheresis & Cell Therapy'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'OECI Comprehensive Cancer Center · EFS Blood Authority',
    globalRanking: '#1 Cancer Center in Europe / Top 4 Worldwide',
    phone: '+33 1 42 11 42 11',
    emergencyTransplantDesk: '+33 1 42 11 40 00',
    annualPatients: '120,000+ Patients',
    boneMarrowBeds: 42,
    bloodBankCapacity: '4,200 units/mo',
    pediatricWigGuildAffiliation: 'Association Enfants Sans Cancer Wig Guild',
    clinicalTrialsCount: 800,
    overview: 'Premier European cancer research campus, leading cross-border HLA donor registries, CAR-T cellular infusions, and pediatric oncology support.',
    colorTheme: '#7c3aed',
    isVerified: true,
    websiteUrl: 'https://www.gustaveroussy.fr'
  },
  {
    id: 'ch_royal_marsden',
    name: 'The Royal Marsden NHS Foundation Trust',
    shortName: 'Royal Marsden',
    city: 'London',
    country: 'United Kingdom',
    region: 'europe',
    latitude: 51.4907,
    longitude: -0.1706,
    worldCoords: { x: 49.9, y: 21.4 },
    oncologySpecialties: [
      'Anthony Nolan Marrow Registry Partner',
      'NHS Blood & Transplant Center',
      'Pediatric Oncology Cranial Hair Center',
      'Living Donor Liver Oncology'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'JACIE Accredited Transplant Program · NHS Specialist Cancer Trust',
    globalRanking: 'Historic World-First Cancer Specialty Hospital',
    phone: '+44 20 7352 8171',
    emergencyTransplantDesk: '+44 20 7808 2000',
    annualPatients: '60,000+ Patients',
    boneMarrowBeds: 35,
    bloodBankCapacity: '3,500 units/mo',
    pediatricWigGuildAffiliation: 'Little Princess Trust Approved Hospital',
    clinicalTrialsCount: 750,
    overview: 'Pioneered modern cancer chemotherapy and whole-body radiation; home to Europe’s largest bone marrow transplant and pediatric oncology units.',
    colorTheme: '#dc2626',
    isVerified: true,
    websiteUrl: 'https://www.royalmarsden.nhs.uk'
  },
  {
    id: 'ch_charite_berlin',
    name: 'Charité Comprehensive Cancer Center (CCCC)',
    shortName: 'Charité Berlin',
    city: 'Berlin',
    country: 'Germany',
    region: 'europe',
    latitude: 52.5262,
    longitude: 13.3777,
    worldCoords: { x: 53.7, y: 20.8 },
    oncologySpecialties: [
      'German Bone Marrow Donor Registry (DKMS)',
      'Organ Resection & Living Donor Liver',
      'Platelet Apheresis Unit',
      'Molecular Oncology'
    ],
    categories: ['blood', 'organ', 'bone_tissue'],
    accreditations: 'DKG Certified Oncology Center · JACIE Bone Marrow Accredited',
    globalRanking: '#1 Ranked University Hospital in Germany',
    phone: '+49 30 450 50',
    emergencyTransplantDesk: '+49 30 450 565 000',
    annualPatients: '80,000+ Patients',
    boneMarrowBeds: 38,
    bloodBankCapacity: '4,000 units/mo',
    pediatricWigGuildAffiliation: 'Charité Kinderkrebshilfe eV',
    clinicalTrialsCount: 520,
    overview: 'One of the largest university hospitals in Europe, managing regional HLA cross-matching, stem cell transplants, and complex surgical oncology.',
    colorTheme: '#ea580c',
    isVerified: true,
    websiteUrl: 'https://cccc.charite.de'
  },
  {
    id: 'ch_national_cancer_japan',
    name: 'National Cancer Center Hospital (NCC Tokyo)',
    shortName: 'NCC Hospital Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    region: 'asia_pacific',
    latitude: 35.6664,
    longitude: 139.7712,
    worldCoords: { x: 88.8, y: 30.2 },
    oncologySpecialties: [
      'Cord Blood & Marrow Transplant (JMDP)',
      'Robotic Minimally Invasive Oncology',
      'Platelet Apheresis Blood Bank',
      'Gastric & Hepatobiliary Cancer Surgery'
    ],
    categories: ['blood', 'organ', 'bone_tissue'],
    accreditations: 'Japan Ministry of Health Cancer Specialty Center · JMDP Partner',
    globalRanking: 'Premier Oncology Institute in Asia',
    phone: '+81 3-3542-2511',
    emergencyTransplantDesk: '+81 3-3547-5201',
    annualPatients: '95,000+ Patients',
    boneMarrowBeds: 45,
    bloodBankCapacity: '5,500 units/mo',
    pediatricWigGuildAffiliation: 'Japan Hair Donation & Charity (JHD&C) Partner',
    clinicalTrialsCount: 680,
    overview: 'Japan’s flagship cancer hospital, holding world records in gastrointestinal and hematologic cancer survival rates and umbilical cord blood transplantation.',
    colorTheme: '#be123c',
    isVerified: true,
    websiteUrl: 'https://www.ncc.go.jp/en/'
  },
  {
    id: 'ch_tata_memorial',
    name: 'Tata Memorial Centre (Advanced Centre for Treatment & Education)',
    shortName: 'Tata Memorial Mumbai',
    city: 'Mumbai',
    country: 'India',
    region: 'asia_pacific',
    latitude: 19.0068,
    longitude: 72.8437,
    worldCoords: { x: 70.2, y: 39.4 },
    oncologySpecialties: [
      'Pediatric Leukemia & Hair Donation',
      'Voluntary Platelet Apheresis',
      'DATRI & Marrow Donor Registry',
      'Low-Cost Philanthropic Oncology Care'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'NABH Accredited · Atomic Energy Regulatory Commission Health Facility',
    globalRanking: 'Largest Tertiary Cancer Referral Center in South Asia',
    phone: '+91 22 2417 7000',
    emergencyTransplantDesk: '+91 22 2417 7280',
    annualPatients: '160,000+ Patients',
    boneMarrowBeds: 50,
    bloodBankCapacity: '9,000 units/mo',
    pediatricWigGuildAffiliation: 'Cope With Cancer - Hair Donation Partner',
    clinicalTrialsCount: 450,
    overview: 'Treats nearly 70% of cancer patients free or subsidized; operates one of Asia’s largest voluntary blood and bone marrow donor registry drives.',
    colorTheme: '#0284c7',
    isVerified: true,
    websiteUrl: 'https://tmc.gov.in'
  },
  {
    id: 'ch_fudan_shanghai',
    name: 'Fudan University Shanghai Cancer Center',
    shortName: 'Fudan Cancer Shanghai',
    city: 'Shanghai',
    country: 'China',
    region: 'asia_pacific',
    latitude: 31.1983,
    longitude: 121.4533,
    worldCoords: { x: 83.7, y: 32.7 },
    oncologySpecialties: [
      'Hematopoietic Stem Cell Transplant',
      'Breast & Gynecological Oncology',
      'Apheresis Blood Depository',
      'Pediatric Oncology Prosthetics'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'Class III Grade A Specialized Cancer Hospital (China MOH)',
    globalRanking: 'Top Ranked Cancer Hospital in Eastern China',
    phone: '+86 21 6417 5590',
    emergencyTransplantDesk: '+86 21 6417 5590',
    annualPatients: '140,000+ Patients',
    boneMarrowBeds: 40,
    bloodBankCapacity: '6,000 units/mo',
    pediatricWigGuildAffiliation: 'Shanghai Charity Foundation Hair Donation',
    clinicalTrialsCount: 580,
    overview: 'Historic cancer institute with over 1,500 inpatient beds, performing world-class bone marrow transplantation and precision oncology surgeries.',
    colorTheme: '#b91c1c',
    isVerified: true,
    websiteUrl: 'https://www.shca.org.cn'
  },
  {
    id: 'ch_peter_maccallum',
    name: 'Peter MacCallum Cancer Centre (Victorian Comprehensive Cancer Centre)',
    shortName: 'Peter Mac Melbourne',
    city: 'Melbourne',
    stateOrProvince: 'VIC',
    country: 'Australia',
    region: 'asia_pacific',
    latitude: -37.7983,
    longitude: 144.9566,
    worldCoords: { x: 90.2, y: 71.0 },
    oncologySpecialties: [
      'CAR-T & Cellular Therapy Centre',
      'Australian Bone Marrow Donor Registry',
      'Lifeblood Apheresis Partner',
      'Melanoma & Sarcoma Immunology'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'ACHS Accredited · TGA Licensed Cellular Manufacturing Facility',
    globalRanking: '#1 Cancer Specialty Hospital in the Southern Hemisphere',
    phone: '+61 3 8559 5000',
    emergencyTransplantDesk: '+61 3 8559 5010',
    annualPatients: '45,000+ Patients',
    boneMarrowBeds: 28,
    bloodBankCapacity: '2,800 units/mo',
    pediatricWigGuildAffiliation: 'Variety Australia Hair with Heart',
    clinicalTrialsCount: 490,
    overview: 'Australia’s only public healthcare service solely dedicated to caring for people affected by cancer; international pioneer in CAR-T cellular therapy.',
    colorTheme: '#0891b2',
    isVerified: true,
    websiteUrl: 'https://www.petermac.org'
  },
  {
    id: 'ch_hospital_de_amor',
    name: 'Hospital de Amor (Hospital de Câncer de Barretos)',
    shortName: 'Hospital de Amor',
    city: 'Barretos (São Paulo)',
    country: 'Brazil',
    region: 'latin_america',
    latitude: -20.5574,
    longitude: -48.5678,
    worldCoords: { x: 36.5, y: 61.4 },
    oncologySpecialties: [
      'Pediatric Oncology & Cranial Wigs',
      'REDOME (National Bone Marrow Registry)',
      'Voluntary Hemotherapy Blood Center',
      'Mobile Cancer Prevention Units'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'ONA Accredited with Excellence · Redome Center of Reference',
    globalRanking: 'Largest 100% Free Oncology Philanthropic Network in Latin America',
    phone: '+55 17 3321 6600',
    emergencyTransplantDesk: '+55 17 3321 6600',
    annualPatients: '190,000+ Patients',
    boneMarrowBeds: 36,
    bloodBankCapacity: '4,500 units/mo',
    pediatricWigGuildAffiliation: 'Fios de Amor - Barretos Hair Donation Guild',
    clinicalTrialsCount: 220,
    overview: 'Providing 100% free treatment under Brazil’s Unified Health System (SUS); operates dedicated pediatric wings, bone marrow harvest units, and hair collection.',
    colorTheme: '#15803d',
    isVerified: true,
    websiteUrl: 'https://hospitaldeamor.com.br'
  },
  {
    id: 'ch_king_hussein',
    name: 'King Hussein Cancer Center (KHCC)',
    shortName: 'KHCC Amman',
    city: 'Amman',
    country: 'Jordan',
    region: 'middle_east_africa',
    latitude: 31.9868,
    longitude: 35.8672,
    worldCoords: { x: 59.9, y: 32.3 },
    oncologySpecialties: [
      'Bone Marrow & Stem Cell Transplant',
      'Pediatric Oncology & Cranial Prosthetics',
      'Regional Blood Banking & Apheresis',
      'Refugee Cancer Patient Relief'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'JCI Comprehensive Cancer Center · CAP Accredited Pathology',
    globalRanking: '#1 Cancer Center in the Middle East',
    phone: '+962 6 530 0460',
    emergencyTransplantDesk: '+962 6 530 0460',
    annualPatients: '40,000+ Patients',
    boneMarrowBeds: 24,
    bloodBankCapacity: '2,400 units/mo',
    pediatricWigGuildAffiliation: 'KHCC Hope Hair Donation Workshop',
    clinicalTrialsCount: 180,
    overview: 'Middle East reference institution treating both regional and humanitarian refugee cancer patients with internationally accredited stem cell transplants.',
    colorTheme: '#d97706',
    isVerified: true,
    websiteUrl: 'https://www.khcc.jo'
  },
  {
    id: 'ch_nci_cairo',
    name: 'National Cancer Institute - Cairo University',
    shortName: 'NCI Cairo',
    city: 'Cairo',
    country: 'Egypt',
    region: 'middle_east_africa',
    latitude: 30.0315,
    longitude: 31.2335,
    worldCoords: { x: 58.7, y: 33.3 },
    oncologySpecialties: [
      'Pediatric Leukemia & Marrow Unit',
      'Apheresis Blood Collection',
      'Surgical Liver & Bladder Oncology',
      'Regional Oncology Training Hub'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'Cairo University Faculty of Medicine Specialty Hospital',
    globalRanking: 'Historic Leading Oncology Institute for North Africa',
    phone: '+20 2 2364 8880',
    emergencyTransplantDesk: '+20 2 2364 8880',
    annualPatients: '75,000+ Patients',
    boneMarrowBeds: 22,
    bloodBankCapacity: '3,000 units/mo',
    pediatricWigGuildAffiliation: 'Egyptian Children’s Cancer Charity Network',
    clinicalTrialsCount: 160,
    overview: 'Primary public tertiary referral hospital for adult and pediatric cancer across Egypt and neighboring African nations.',
    colorTheme: '#c2410c',
    isVerified: true,
    websiteUrl: 'https://nci.cu.edu.eg'
  },
  {
    id: 'ch_st_jude',
    name: "St. Jude Children's Research Hospital",
    shortName: 'St. Jude Memphis',
    city: 'Memphis',
    stateOrProvince: 'TN',
    country: 'United States',
    region: 'north_america',
    latitude: 35.1536,
    longitude: -90.0434,
    worldCoords: { x: 25.0, y: 30.5 },
    oncologySpecialties: [
      'Pediatric Acute Lymphoblastic Leukemia',
      'Unrelated Donor Bone Marrow Registry',
      'Childhood Cancer Wig Workshop Guild',
      'Whole Blood & Platelet Apheresis'
    ],
    categories: ['blood', 'bone_tissue', 'hair'],
    accreditations: 'NCI-Designated Comprehensive Cancer Center · FACT Accredited',
    globalRanking: '#1 Global Non-Profit Pediatric Oncology Research Institution',
    phone: '+1 (866) 278-5833',
    emergencyTransplantDesk: '+1 (800) 822-6344',
    annualPatients: '65,000+ Young Patients',
    boneMarrowBeds: 44,
    bloodBankCapacity: '5,800 units/mo',
    pediatricWigGuildAffiliation: "St. Jude Crown of Courage Hair Donation Program",
    clinicalTrialsCount: 920,
    overview: 'Leading global pioneer in catastrophic childhood cancer care where families never receive a bill for treatment, travel, housing, or food.',
    colorTheme: '#0284c7',
    isVerified: true,
    websiteUrl: 'https://www.stjude.org'
  },
  {
    id: 'ch_asan_seoul',
    name: 'Asan Medical Center Cancer Institute',
    shortName: 'Asan Cancer Seoul',
    city: 'Seoul',
    country: 'South Korea',
    region: 'asia_pacific',
    latitude: 37.5268,
    longitude: 127.1086,
    worldCoords: { x: 85.3, y: 29.2 },
    oncologySpecialties: [
      'Living Donor Liver & Kidney Transplantation',
      'Allogeneic Stem Cell & Marrow Transplants',
      'Apheresis Blood Depository',
      'Precision Robotic Surgical Oncology'
    ],
    categories: ['blood', 'organ', 'bone_tissue'],
    accreditations: 'Korea Ministry of Health Accredited · Asian Reference Transplant Center',
    globalRanking: 'Top 5 Cancer Hospital in Asia (#1 Living Donor Transplant Volume)',
    phone: '+82 2-3010-3114',
    emergencyTransplantDesk: '+82 2-3010-3333',
    annualPatients: '110,000+ Patients',
    boneMarrowBeds: 46,
    bloodBankCapacity: '6,400 units/mo',
    pediatricWigGuildAffiliation: 'Korea Childhood Leukemia Foundation Partner',
    clinicalTrialsCount: 540,
    overview: 'South Korea’s premier medical center performing world-record volumes in living-donor solid organ transplants for oncology patients and cellular therapy.',
    colorTheme: '#0d9488',
    isVerified: true,
    websiteUrl: 'https://eng.amc.seoul.kr'
  },
  {
    id: 'ch_ncis_singapore',
    name: 'National University Cancer Institute, Singapore (NCIS)',
    shortName: 'NCIS Singapore',
    city: 'Singapore',
    country: 'Singapore',
    region: 'asia_pacific',
    latitude: 1.2937,
    longitude: 103.7831,
    worldCoords: { x: 78.8, y: 49.3 },
    oncologySpecialties: [
      'CAR-T Cellular Immunotherapy Centre',
      'Bone Marrow Donor Programme (BMDP)',
      'Pediatric Oncology Cranial Hair Guild',
      'Hepatobiliary Living Donor Oncology'
    ],
    categories: ['blood', 'organ', 'bone_tissue', 'hair'],
    accreditations: 'JCI Accredited Academic Medical Centre · Singapore MOH Specialty Center',
    globalRanking: 'Leading Oncology Hub for Southeast Asia & Pacific Rim',
    phone: '+65 6779 5555',
    emergencyTransplantDesk: '+65 6772 5555',
    annualPatients: '52,000+ Patients',
    boneMarrowBeds: 30,
    bloodBankCapacity: '3,200 units/mo',
    pediatricWigGuildAffiliation: 'Children’s Cancer Foundation (CCF) Hair for Hope',
    clinicalTrialsCount: 380,
    overview: 'Flagship cancer institute of the National University Health System, offering comprehensive stem cell, apheresis, and clinical trials for Southeast Asia.',
    colorTheme: '#4f46e5',
    isVerified: true,
    websiteUrl: 'https://www.ncis.com.sg'
  }
];
