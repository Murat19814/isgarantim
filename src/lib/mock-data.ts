/**
 * Ana sayfa vitrini için örnek (mock) veriler.
 * Faz 2+ ile bunlar veritabanından (Prisma) gelecek.
 */

export type MockProvider = {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
  avatar: string;
  responseTime: string;
};

export const MOCK_PROVIDERS: MockProvider[] = [
  {
    id: "p1",
    name: "Mehmet Y.",
    category: "Boya & Badana Ustası",
    city: "İstanbul",
    rating: 4.9,
    reviewCount: 214,
    completedJobs: 340,
    verified: true,
    avatar: "MY",
    responseTime: "~15 dk",
  },
  {
    id: "p2",
    name: "Ayşe K.",
    category: "Ev & Ofis Temizliği",
    city: "Ankara",
    rating: 4.8,
    reviewCount: 187,
    completedJobs: 290,
    verified: true,
    avatar: "AK",
    responseTime: "~30 dk",
  },
  {
    id: "p3",
    name: "Serkan D.",
    category: "Kombi & Su Tesisatı",
    city: "İzmir",
    rating: 5.0,
    reviewCount: 96,
    completedJobs: 152,
    verified: true,
    avatar: "SD",
    responseTime: "~10 dk",
  },
  {
    id: "p4",
    name: "Elif T.",
    category: "Nakliyat (Evden Eve)",
    city: "Bursa",
    rating: 4.7,
    reviewCount: 133,
    completedJobs: 205,
    verified: true,
    avatar: "ET",
    responseTime: "~45 dk",
  },
];

export type MockJob = {
  id: string;
  title: string;
  company: string;
  city: string;
  workType: string;
  salary?: string;
  postedAt: string;
  logo: string;
};

export const MOCK_JOBS: MockJob[] = [
  {
    id: "j1",
    title: "Kıdemli Muhasebe Uzmanı",
    company: "Kaya Danışmanlık",
    city: "İstanbul",
    workType: "Tam Zamanlı",
    salary: "45.000 - 60.000 ₺",
    postedAt: "2 saat önce",
    logo: "KD",
  },
  {
    id: "j2",
    title: "Frontend Developer (React)",
    company: "Nova Yazılım",
    city: "Uzaktan",
    workType: "Uzaktan",
    salary: "70.000 - 95.000 ₺",
    postedAt: "5 saat önce",
    logo: "NV",
  },
  {
    id: "j3",
    title: "Çağrı Merkezi Müşteri Temsilcisi",
    company: "BLC İletişim",
    city: "Ankara",
    workType: "Tam Zamanlı",
    salary: "30.000 - 38.000 ₺",
    postedAt: "1 gün önce",
    logo: "BL",
  },
  {
    id: "j4",
    title: "Depo & Lojistik Sorumlusu",
    company: "Hızlı Kargo A.Ş.",
    city: "İzmir",
    workType: "Tam Zamanlı",
    salary: "32.000 - 40.000 ₺",
    postedAt: "1 gün önce",
    logo: "HK",
  },
];
