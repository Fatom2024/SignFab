export enum ProjectStatus {
  DEVIS = 'Devis',
  EN_COURS = 'En cours',
  TERMINE = 'Terminé',
  LIVRE = 'Livré',
}

export enum ProductionStepStatus {
  A_FAIRE = 'À faire',
  EN_COURS = 'En cours',
  TERMINE = 'Terminé',
}

export enum BillingType {
  PER_SQM = 'Par m²',
  PER_UNIT = 'Par unité',
}

export interface ProductionStep {
  id: string; // Unique ID for this instance of the step in a project
  templateId: string; // Link to the ProductionStepTemplate
  name: string; // Copied from template for display convenience
  status: ProductionStepStatus;
  quantity: number;
  width?: number; // in meters
  height?: number; // in meters
  price: number; // The calculated price for this step
}

export interface ProjectFile {
  name: string;
  url: string; // In a real app, this might be a path to a file on the server
  description?: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  projectName: string;
  creationDate: string;
  dueDate: string;
  subTotal: number; // Sum of productionSteps prices
  discount: number; // Percentage
  tvaRate: number; // Percentage
  timbreRate: number; // Percentage
  price: number; // Final calculated price
  status: ProjectStatus;
  productionSteps: ProductionStep[];
  files: ProjectFile[];
}

export enum ClientType {
    PARTICULIER = 'Client Particulier',
    REVENDEUR = 'Revendeur',
    ENTREPRISE = 'Entreprise',
}

interface ClientBase {
    id: string;
    type: ClientType;
    name: string;
    contactEmail: string;
    contactPhone: string;
    projectIds: string[];
}

export interface ClientParticulierRevendeur extends ClientBase {
    type: ClientType.PARTICULIER | ClientType.REVENDEUR;
}

export interface ClientEntreprise extends ClientBase {
    type: ClientType.ENTREPRISE;
    rc: string; // Registre du Commerce
    nif: string; // Numéro d'Identification Fiscale
    nis: string; // Numéro d'Identification Statistique
    bankAccount: string;
}

export type Client = ClientParticulierRevendeur | ClientEntreprise;

export interface ProductionStepTemplate {
  id: string;
  name: string;
  billingType: BillingType;
  pricing: {
    [key in ClientType]: number; // Price per m² or per unit
  };
}

export interface CompanySettings {
  logoUrl: string | null;
  companyName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  pricePerUnit: number;
  lastUpdated: string;
}


// For API responses, separating data from potential errors
export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error?: string;
};