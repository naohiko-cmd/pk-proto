export enum Industry {
  IT_SOFTWARE = "IT・ソフトウェア",
  MANUFACTURING = "製造業",
  RETAIL_EC = "小売・EC",
  MEDICAL_HEALTHCARE = "医療・ヘルスケア",
  CONSTRUCTION_REAL_ESTATE = "建設・不動産",
  SERVICE = "サービス業",
  OTHER = "その他"
}

export enum CompanySize {
  STARTUP = "スタートアップ (10名未満)",
  SMALL = "小規模 (10-50名)",
  MEDIUM = "中規模 (50-300名)",
  LARGE = "大規模 (300名以上)"
}

export enum ExhibitionPurpose {
  LEAD_GEN = "新規リード獲得",
  BRANDING = "ブランディング・認知拡大",
  PRODUCT_LAUNCH = "新製品発表",
  NETWORKING = "既存顧客・パートナーとの交流"
}

export interface CompanyProfile {
  industry: Industry;
  size: CompanySize;
  purpose: ExhibitionPurpose;
  budget: number;
  targetRegion: string;
}

export interface ExhibitionPlan {
  title: string;
  description: string;
  suggestedExhibitions: {
    name: string;
    timing: string;
    reason: string;
    estimatedCost: number;
  }[];
  budgetAllocation: {
    category: string;
    amount: number;
    note: string;
  }[];
}

export interface PreparationTask {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  category: "planning" | "booth" | "marketing" | "logistics" | "followup";
  status: "todo" | "done";
}
