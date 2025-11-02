/**
 * Storage service for managing saved startups using IndexedDB
 * Provides better persistence than localStorage and doesn't clear cache
 */

class StorageService {
  constructor() {
    this.dbName = 'InvestAIStorage';
    this.dbVersion = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create savedStartups store if it doesn't exist
        if (!db.objectStoreNames.contains('savedStartups')) {
          const store = db.createObjectStore('savedStartups', { keyPath: 'id' });
          store.createIndex('investorId', 'investorId', { unique: false });
          store.createIndex('startupId', 'startupId', { unique: false });
          store.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
  }

  async saveStartup(investorId, startup) {
    try {
      await this.ensureDB();
      
      const savedStartup = {
        id: `${investorId}_${startup.id}`,
        investorId,
        startupId: startup.id,
        startupData: {
          id: startup.id,
          name: startup.name || startup.companyName,
          description: startup.description,
          industry: startup.industry || startup.sector,
          stage: startup.stage,
          teamSize: startup.teamSize,
          foundedYear: startup.foundedYear,
          overallScore: startup.overallScore,
          website: startup.website,
          location: startup.location,
          createdAt: startup.createdAt
        },
        savedAt: new Date().toISOString()
      };

      const transaction = this.db.transaction(['savedStartups'], 'readwrite');
      const store = transaction.objectStore('savedStartups');
      
      return new Promise((resolve, reject) => {
        const request = store.put(savedStartup);
        
        request.onsuccess = () => {
          console.log('Startup saved to IndexedDB:', savedStartup.id);
          resolve(savedStartup);
        };
        
        request.onerror = () => {
          console.error('Failed to save startup to IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error saving startup to IndexedDB:', error);
      throw error;
    }
  }

  async unsaveStartup(investorId, startupId) {
    try {
      await this.ensureDB();
      
      const transaction = this.db.transaction(['savedStartups'], 'readwrite');
      const store = transaction.objectStore('savedStartups');
      const id = `${investorId}_${startupId}`;
      
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          console.log('Startup removed from IndexedDB:', id);
          resolve();
        };
        
        request.onerror = () => {
          console.error('Failed to remove startup from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error removing startup from IndexedDB:', error);
      throw error;
    }
  }

  async isStartupSaved(investorId, startupId) {
    try {
      await this.ensureDB();
      
      const transaction = this.db.transaction(['savedStartups'], 'readonly');
      const store = transaction.objectStore('savedStartups');
      const id = `${investorId}_${startupId}`;
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(!!request.result);
        };
        
        request.onerror = () => {
          console.error('Failed to check if startup is saved:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error checking if startup is saved:', error);
      return false;
    }
  }

  async getSavedStartups(investorId) {
    try {
      await this.ensureDB();
      
      const transaction = this.db.transaction(['savedStartups'], 'readonly');
      const store = transaction.objectStore('savedStartups');
      const index = store.index('investorId');
      
      return new Promise((resolve, reject) => {
        const request = index.getAll(investorId);
        
        request.onsuccess = () => {
          const savedStartups = request.result.sort((a, b) => 
            new Date(b.savedAt) - new Date(a.savedAt)
          );
          console.log(`Found ${savedStartups.length} saved startups for investor ${investorId}`);
          resolve(savedStartups);
        };
        
        request.onerror = () => {
          console.error('Failed to get saved startups:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error getting saved startups:', error);
      return [];
    }
  }

  async clearAllSavedStartups(investorId) {
    try {
      await this.ensureDB();
      
      const transaction = this.db.transaction(['savedStartups'], 'readwrite');
      const store = transaction.objectStore('savedStartups');
      const index = store.index('investorId');
      
      return new Promise((resolve, reject) => {
        const request = index.getAllKeys(investorId);
        
        request.onsuccess = () => {
          const keys = request.result;
          const deletePromises = keys.map(key => {
            return new Promise((deleteResolve, deleteReject) => {
              const deleteRequest = store.delete(key);
              deleteRequest.onsuccess = () => deleteResolve();
              deleteRequest.onerror = () => deleteReject(deleteRequest.error);
            });
          });
          
          Promise.all(deletePromises)
            .then(() => {
              console.log(`Cleared ${keys.length} saved startups for investor ${investorId}`);
              resolve();
            })
            .catch(reject);
        };
        
        request.onerror = () => {
          console.error('Failed to clear saved startups:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error clearing saved startups:', error);
      throw error;
    }
  }

  // Fallback to localStorage if IndexedDB is not available
  async saveStartupFallback(investorId, startup) {
    try {
      const key = `savedStartups_${investorId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      
      const savedStartup = {
        id: `${investorId}_${startup.id}`,
        investorId,
        startupId: startup.id,
        startupData: {
          id: startup.id,
          name: startup.name || startup.companyName,
          description: startup.description,
          industry: startup.industry || startup.sector,
          stage: startup.stage,
          teamSize: startup.teamSize,
          foundedYear: startup.foundedYear,
          overallScore: startup.overallScore,
          website: startup.website,
          location: startup.location,
          createdAt: startup.createdAt
        },
        savedAt: new Date().toISOString()
      };

      // Check if already exists
      const exists = existing.find(item => item.startupId === startup.id);
      if (!exists) {
        existing.push(savedStartup);
        localStorage.setItem(key, JSON.stringify(existing));
        console.log('Startup saved to localStorage:', savedStartup.id);
      }
      
      return savedStartup;
    } catch (error) {
      console.error('Error saving startup to localStorage:', error);
      throw error;
    }
  }

  async unsaveStartupFallback(investorId, startupId) {
    try {
      const key = `savedStartups_${investorId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter(item => item.startupId !== startupId);
      localStorage.setItem(key, JSON.stringify(filtered));
      console.log('Startup removed from localStorage:', startupId);
    } catch (error) {
      console.error('Error removing startup from localStorage:', error);
      throw error;
    }
  }

  async isStartupSavedFallback(investorId, startupId) {
    try {
      const key = `savedStartups_${investorId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      return existing.some(item => item.startupId === startupId);
    } catch (error) {
      console.error('Error checking if startup is saved in localStorage:', error);
      return false;
    }
  }

  async getSavedStartupsFallback(investorId) {
    try {
      const key = `savedStartups_${investorId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      return existing.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    } catch (error) {
      console.error('Error getting saved startups from localStorage:', error);
      return [];
    }
  }
}

// Create singleton instance
const storageService = new StorageService();

// Initialize on load
if (typeof window !== 'undefined') {
  storageService.init().catch(error => {
    console.warn('IndexedDB initialization failed, will use localStorage fallback:', error);
  });
}

export default storageService;
