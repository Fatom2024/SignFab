import { Project, Client, ProjectStatus, ProductionStepStatus, ProductionStep, ClientType, ProductionStepTemplate, BillingType } from './types';

export const MOCK_STEP_TEMPLATES: ProductionStepTemplate[] = [
  {
    id: 'step-tpl-1',
    name: 'Conception graphique',
    billingType: BillingType.PER_UNIT,
    pricing: {
      [ClientType.PARTICULIER]: 10000,
      [ClientType.REVENDEUR]: 7000,
      [ClientType.ENTREPRISE]: 9000,
    },
  },
  {
    id: 'step-tpl-2',
    name: 'Impression',
    billingType: BillingType.PER_SQM,
     pricing: {
      [ClientType.PARTICULIER]: 28000,
      [ClientType.REVENDEUR]: 22000,
      [ClientType.ENTREPRISE]: 25000,
    },
  },
  {
    id: 'step-tpl-3',
    name: 'Découpe',
    billingType: BillingType.PER_SQM,
     pricing: {
      [ClientType.PARTICULIER]: 6000,
      [ClientType.REVENDEUR]: 4000,
      [ClientType.ENTREPRISE]: 5000,
    },
  },
  {
    id: 'step-tpl-4',
    name: 'Assemblage',
    billingType: BillingType.PER_UNIT,
     pricing: {
      [ClientType.PARTICULIER]: 4000,
      [ClientType.REVENDEUR]: 3000,
      [ClientType.ENTREPRISE]: 3800,
    },
  },
  {
    id: 'step-tpl-5',
    name: 'Finition',
    billingType: BillingType.PER_UNIT,
     pricing: {
      [ClientType.PARTICULIER]: 2500,
      [ClientType.REVENDEUR]: 1800,
      [ClientType.ENTREPRISE]: 2200,
    },
  },
   {
    id: 'step-tpl-6',
    name: 'Contrôle qualité',
    billingType: BillingType.PER_UNIT,
     pricing: {
      [ClientType.PARTICULIER]: 1500,
      [ClientType.REVENDEUR]: 1000,
      [ClientType.ENTREPRISE]: 1200,
    },
  },
];


export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    clientId: 'client-01',
    clientName: 'Boulangerie "Le Bon Pain"',
    projectName: 'Enseigne lumineuse LED',
    creationDate: '2024-07-15',
    dueDate: '2024-08-01',
    subTotal: 309000,
    discount: 0,
    tvaRate: 0,
    timbreRate: 0,
    price: 309000,
    status: ProjectStatus.EN_COURS,
    productionSteps: [
      { id: 'step-1-1', templateId: 'step-tpl-1', name: 'Conception graphique', status: ProductionStepStatus.TERMINE, quantity: 1, price: 9000 },
      { id: 'step-1-2', templateId: 'step-tpl-2', name: 'Impression', status: ProductionStepStatus.EN_COURS, quantity: 1, width: 5, height: 2, price: 250000 },
      { id: 'step-1-3', templateId: 'step-tpl-3', name: 'Découpe', status: ProductionStepStatus.A_FAIRE, quantity: 1, width: 5, height: 2, price: 50000 },
    ],
    files: [{ name: 'maquette_v2.pdf', url: '#', description: 'Première version de la maquette validée.' }]
  },
  {
    id: 'proj-002',
    clientId: 'client-02',
    clientName: 'Café "Le Torréfacteur"',
    projectName: 'Vitrophanie et Menus',
    creationDate: '2024-07-18',
    dueDate: '2024-07-25',
    subTotal: 85000,
    discount: 0,
    tvaRate: 0,
    timbreRate: 0,
    price: 85000,
    status: ProjectStatus.TERMINE,
    productionSteps: [
      { id: 'step-2-1', templateId: 'step-tpl-1', name: 'Conception graphique', status: ProductionStepStatus.TERMINE, quantity: 2, price: 20000 },
      { id: 'step-2-2', templateId: 'step-tpl-2', name: 'Impression', status: ProductionStepStatus.TERMINE, quantity: 100, width: 0.297, height: 0.21, price: 65000 }, // A4 menus
    ],
    files: [{ name: 'menu_final.ai', url: '#', description: 'Fichier vectoriel pour impression.' }]
  },
  {
    id: 'proj-003',
    clientId: 'client-04',
    clientName: 'Garage Auto-Pro',
    projectName: 'Banderole promotionnelle',
    creationDate: '2024-07-20',
    dueDate: '2024-07-30',
    subTotal: 40000,
    discount: 0,
    tvaRate: 0,
    timbreRate: 0,
    price: 40000,
    status: ProjectStatus.DEVIS,
    productionSteps: [
        { id: 'step-3-1', templateId: 'step-tpl-2', name: 'Impression', status: ProductionStepStatus.A_FAIRE, quantity: 1, width: 4, height: 1, price: 40000 }
    ],
    files: []
  },
    {
    id: 'proj-004',
    clientId: 'client-05',
    clientName: 'Librairie "La Plume"',
    projectName: 'Marque-pages et flyers',
    creationDate: '2024-07-21',
    dueDate: '2024-08-05',
    subTotal: 62000,
    discount: 0,
    tvaRate: 0,
    timbreRate: 0,
    price: 62000,
    status: ProjectStatus.LIVRE,
    productionSteps: [
      { id: 'step-4-1', templateId: 'step-tpl-1', name: 'Conception graphique', status: ProductionStepStatus.TERMINE, quantity: 1, price: 9000 },
      { id: 'step-4-2', templateId: 'step-tpl-2', name: 'Impression', status: ProductionStepStatus.TERMINE, quantity: 500, width: 0.1, height: 0.21, price: 52500 }, // Flyers
      { id: 'step-4-3', templateId: 'step-tpl-3', name: 'Découpe', status: ProductionStepStatus.TERMINE, quantity: 500, width: 0.1, height: 0.21, price: 500 },
    ],
    files: [{ name: 'flyer_a5.pdf', url: '#', description: 'Flyer promotionnel pour la rentrée.' }]
  }
];

export const MOCK_CLIENTS: Client[] = [
    {
        id: 'client-01',
        type: ClientType.ENTREPRISE,
        name: 'Boulangerie "Le Bon Pain"',
        contactEmail: 'contact@lebonpain.fr',
        contactPhone: '01 23 45 67 89',
        projectIds: ['proj-001'],
        rc: '123/456-789',
        nif: '987654321',
        nis: '123456789',
        bankAccount: 'FR76 1234 5678 9012 3456 7890 123'
    },
    {
        id: 'client-02',
        type: ClientType.PARTICULIER,
        name: 'Café "Le Torréfacteur"',
        contactEmail: 'gerant@letorrefacteur.com',
        contactPhone: '09 87 65 43 21',
        projectIds: ['proj-002']
    },
    {
        id: 'client-03',
        type: ClientType.REVENDEUR,
        name: 'Agence Publi-Plus',
        contactEmail: 'achats@publiplus.dz',
        contactPhone: '05 55 12 34 56',
        projectIds: []
    },
    {
        id: 'client-04',
        type: ClientType.ENTREPRISE,
        name: 'Garage Auto-Pro',
        contactEmail: 'contact@autopro.dz',
        contactPhone: '05 55 04 04 04',
        projectIds: ['proj-003'],
        rc: 'RC456',
        nif: 'NIF456',
        nis: 'NIS456',
        bankAccount: 'DZD 456'
    },
    {
        id: 'client-05',
        type: ClientType.ENTREPRISE,
        name: 'Librairie "La Plume"',
        contactEmail: 'contact@laplume.dz',
        contactPhone: '05 55 05 05 05',
        projectIds: ['proj-004'],
        rc: 'RC789',
        nif: 'NIF789',
        nis: 'NIS789',
        bankAccount: 'DZD 789'
    }
];