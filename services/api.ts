
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  Project, 
  ApiResponse, 
  ProductionStepStatus, 
  ProductionStep, 
  ProjectFile, 
  Client, 
  ClientType, 
  ProductionStepTemplate, 
  ClientEntreprise, 
  BillingType,
  StockItem
} from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const apiService = {
    getProjects: async (): Promise<ApiResponse<Project[]>> => {
        const path = 'projects';
        try {
            const q = query(collection(db, path), orderBy('creationDate', 'desc'));
            const querySnapshot = await getDocs(q);
            const projects = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Project));
            return { success: true, data: projects };
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    getProjectById: async (id: string): Promise<ApiResponse<Project>> => {
        const path = `projects/${id}`;
        try {
            const docRef = doc(db, 'projects', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } as Project };
            }
            return { success: false, data: null, error: 'Project not found' };
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    addProject: async (projectData: Omit<Project, 'id' | 'creationDate' | 'files'>): Promise<ApiResponse<Project>> => {
        const path = 'projects';
        try {
            const newProjectData = {
                ...projectData,
                creationDate: new Date().toISOString().split('T')[0],
                files: [],
            };
            const docRef = await addDoc(collection(db, path), newProjectData);
            return { success: true, data: { id: docRef.id, ...newProjectData } as Project };
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    updateProject: async (projectId: string, updates: Partial<Project>): Promise<ApiResponse<Project>> => {
        const path = `projects/${projectId}`;
        try {
            const docRef = doc(db, 'projects', projectId);
            await updateDoc(docRef, updates);
            const updatedSnap = await getDoc(docRef);
            return { success: true, data: { id: updatedSnap.id, ...updatedSnap.data() } as Project };
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    deleteProject: async (projectId: string): Promise<ApiResponse<{ id: string }>> => {
        const path = `projects/${projectId}`;
        try {
            await deleteDoc(doc(db, 'projects', projectId));
            return { success: true, data: { id: projectId } };
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    addFileToProject: async (projectId: string, file: { name: string, description?: string }): Promise<ApiResponse<Project>> => {
        const path = `projects/${projectId}`;
        try {
            const docRef = doc(db, 'projects', projectId);
            const projectSnap = await getDoc(docRef);
            if (!projectSnap.exists()) throw new Error('Project not found');
            
            const project = projectSnap.data() as Project;
            const newFile: ProjectFile = {
                name: file.name,
                url: '#', // In a real app, this would be a Firebase Storage URL
                description: file.description,
            };
            
            const updatedFiles = [...(project.files || []), newFile];
            await updateDoc(docRef, { files: updatedFiles });
            return { success: true, data: { ...project, id: projectId, files: updatedFiles } };
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    deleteFileFromProject: async (projectId: string, fileName: string): Promise<ApiResponse<Project>> => {
        const path = `projects/${projectId}`;
        try {
            const docRef = doc(db, 'projects', projectId);
            const projectSnap = await getDoc(docRef);
            if (!projectSnap.exists()) throw new Error('Project not found');
            
            const project = projectSnap.data() as Project;
            const updatedFiles = project.files.filter(f => f.name !== fileName);
            await updateDoc(docRef, { files: updatedFiles });
            return { success: true, data: { ...project, id: projectId, files: updatedFiles } };
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    // --- Client Functions ---
    getClients: async (): Promise<ApiResponse<Client[]>> => {
        const path = 'clients';
        try {
            const q = query(collection(db, path), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);
            const clients = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Client));
            return { success: true, data: clients };
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    addClient: async (clientData: Omit<Client, 'id' | 'projectIds'>): Promise<ApiResponse<Client>> => {
        const path = 'clients';
        try {
            const newClientData = {
                ...clientData,
                projectIds: [],
            };
            const docRef = await addDoc(collection(db, path), newClientData);
            return { success: true, data: { id: docRef.id, ...newClientData } as Client };
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    updateClient: async (clientId: string, updates: Partial<Client>): Promise<ApiResponse<Client>> => {
        const path = `clients/${clientId}`;
        try {
            const docRef = doc(db, 'clients', clientId);
            await updateDoc(docRef, updates);
            const updatedSnap = await getDoc(docRef);
            return { success: true, data: { id: updatedSnap.id, ...updatedSnap.data() } as Client };
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    deleteClient: async (clientId: string): Promise<ApiResponse<{ id: string }>> => {
        const path = `clients/${clientId}`;
        try {
            await deleteDoc(doc(db, 'clients', clientId));
            return { success: true, data: { id: clientId } };
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },
    
    // --- Production Step Template Functions ---
    getProductionStepTemplates: async (): Promise<ApiResponse<ProductionStepTemplate[]>> => {
        const path = 'productionStepTemplates';
        try {
            const q = query(collection(db, path), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);
            const templates = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ProductionStepTemplate));
            return { success: true, data: templates };
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    updateProductionStepTemplate: async (templateId: string, updates: Partial<ProductionStepTemplate>): Promise<ApiResponse<ProductionStepTemplate>> => {
        const path = `productionStepTemplates/${templateId}`;
        try {
            const docRef = doc(db, 'productionStepTemplates', templateId);
            await updateDoc(docRef, updates);
            const updatedSnap = await getDoc(docRef);
            return { success: true, data: { id: updatedSnap.id, ...updatedSnap.data() } as ProductionStepTemplate };
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    addProductionStepTemplate: async (): Promise<ApiResponse<ProductionStepTemplate>> => {
        const path = 'productionStepTemplates';
        try {
            const newTemplate = {
                name: 'Nouvelle Étape',
                billingType: BillingType.PER_UNIT,
                pricing: {
                    [ClientType.PARTICULIER]: 0,
                    [ClientType.REVENDEUR]: 0,
                    [ClientType.ENTREPRISE]: 0,
                },
            };
            const docRef = await addDoc(collection(db, path), newTemplate);
            return { success: true, data: { id: docRef.id, ...newTemplate } as ProductionStepTemplate };
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
            return { success: false, data: null, error: (error as Error).message };
        }
    },

    deleteProductionStepTemplate: async (templateId: string): Promise<ApiResponse<{ id: string }>> => {
      const path = `productionStepTemplates/${templateId}`;
      try {
        await deleteDoc(doc(db, 'productionStepTemplates', templateId));
        return { success: true, data: { id: templateId } };
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
        return { success: false, data: null, error: (error as Error).message };
      }
    },

    // --- Stock Functions ---
    getStock: async (): Promise<ApiResponse<StockItem[]>> => {
      const path = 'stock';
      try {
        const q = query(collection(db, path), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const stockItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StockItem));
        return { success: true, data: stockItems };
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
        return { success: false, data: null, error: (error as Error).message };
      }
    },

    addStockItem: async (itemData: Omit<StockItem, 'id' | 'lastUpdated'>): Promise<ApiResponse<StockItem>> => {
      const path = 'stock';
      try {
        const newItemData = {
          ...itemData,
          lastUpdated: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, path), newItemData);
        return { success: true, data: { id: docRef.id, ...newItemData } as StockItem };
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
        return { success: false, data: null, error: (error as Error).message };
      }
    },

    updateStockItem: async (itemId: string, updates: Partial<StockItem>): Promise<ApiResponse<StockItem>> => {
      const path = `stock/${itemId}`;
      try {
        const docRef = doc(db, 'stock', itemId);
        const itemUpdates = {
          ...updates,
          lastUpdated: new Date().toISOString(),
        };
        await updateDoc(docRef, itemUpdates);
        const updatedSnap = await getDoc(docRef);
        return { success: true, data: { id: updatedSnap.id, ...updatedSnap.data() } as StockItem };
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
        return { success: false, data: null, error: (error as Error).message };
      }
    },

    deleteStockItem: async (itemId: string): Promise<ApiResponse<{ id: string }>> => {
      const path = `stock/${itemId}`;
      try {
        await deleteDoc(doc(db, 'stock', itemId));
        return { success: true, data: { id: itemId } };
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
        return { success: false, data: null, error: (error as Error).message };
      }
    },
};
;