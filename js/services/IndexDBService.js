// js/services/IndexDBService.js
const IndexDBService = {
  dbName: "FormDatabase",
  version: 1,
  storeName: "forms",
  db: null,

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        IndexDBService.dbName,
        IndexDBService.version
      );

      request.onerror = () => {
        console.error("Failed to open IndexedDB");
        reject(request.error);
      };

      request.onsuccess = () => {
        IndexDBService.db = request.result;
        console.log("IndexedDB initialized successfully");
        resolve(IndexDBService.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(IndexDBService.storeName)) {
          const objectStore = db.createObjectStore(IndexDBService.storeName, {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes
          objectStore.createIndex("timestamp", "timestamp", { unique: false });
          objectStore.createIndex("step", "step", { unique: false });
          objectStore.createIndex("isComplete", "isComplete", {
            unique: false,
          });
          objectStore.createIndex("sessionId", "sessionId", { unique: false });
        }
      };
    });
  },

  // Create a new form entry
  async createForm(sessionId) {
    if (!IndexDBService.db) {
      await IndexDBService.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = IndexDBService.db.transaction(
        [IndexDBService.storeName],
        "readwrite"
      );
      const store = transaction.objectStore(IndexDBService.storeName);

      const dataToSave = {
        sessionId: sessionId,
        formData: {},
        step: 1,
        timestamp: new Date().toISOString(),
        isComplete: false,
        isOnline: FormService.getIsOnline(),
      };

      const request = store.add(dataToSave);

      request.onsuccess = () => {
        console.log("New form created in IndexedDB with ID:", request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("Failed to create form");
        reject(request.error);
      };
    });
  },

  // Update existing form
  async updateForm(formId, formData, currentStep, isComplete = false) {
    if (!IndexDBService.db) {
      await IndexDBService.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = IndexDBService.db.transaction(
        [IndexDBService.storeName],
        "readwrite"
      );
      const store = transaction.objectStore(IndexDBService.storeName);

      // First get the existing record
      const getRequest = store.get(formId);

      getRequest.onsuccess = () => {
        const existingData = getRequest.result;

        if (!existingData) {
          reject(new Error("Form not found"));
          return;
        }

        // Update the existing record
        const updatedData = {
          ...existingData,
          formData: formData,
          step: currentStep,
          lastUpdated: new Date().toISOString(),
          isComplete: isComplete,
          isOnline: FormService.getIsOnline(),
        };

        const updateRequest = store.put(updatedData);

        updateRequest.onsuccess = () => {
          console.log("Form updated in IndexedDB");
          resolve(updateRequest.result);
        };

        updateRequest.onerror = () => {
          console.error("Failed to update form");
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  },

  // Get a form by ID
  async getForm(id) {
    if (!IndexDBService.db) {
      await IndexDBService.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = IndexDBService.db.transaction(
        [IndexDBService.storeName],
        "readonly"
      );
      const store = transaction.objectStore(IndexDBService.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  // Get all forms from IndexedDB
  async getAllForms() {
    if (!IndexDBService.db) {
      await IndexDBService.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = IndexDBService.db.transaction(
        [IndexDBService.storeName],
        "readonly"
      );
      const store = transaction.objectStore(IndexDBService.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  // Delete a form from IndexedDB
  async deleteForm(id) {
    if (!IndexDBService.db) {
      await IndexDBService.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = IndexDBService.db.transaction(
        [IndexDBService.storeName],
        "readwrite"
      );
      const store = transaction.objectStore(IndexDBService.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log("Form deleted from IndexedDB");
        resolve();
      };

      request.onerror = () => {
        console.error("Failed to delete form");
        reject(request.error);
      };
    });
  },

  // Clear all forms from IndexedDB
  async clearAllForms() {
    if (!IndexDBService.db) {
      await IndexDBService.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = IndexDBService.db.transaction(
        [IndexDBService.storeName],
        "readwrite"
      );
      const store = transaction.objectStore(IndexDBService.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log("All forms cleared from IndexedDB");
        resolve();
      };

      request.onerror = () => {
        console.error("Failed to clear forms");
        reject(request.error);
      };
    });
  },

  // Get incomplete forms (for debugging/admin purposes)
  async getIncompleteForms() {
    if (!IndexDBService.db) {
      await IndexDBService.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = IndexDBService.db.transaction(
        [IndexDBService.storeName],
        "readonly"
      );
      const store = transaction.objectStore(IndexDBService.storeName);
      const index = store.index("isComplete");
      const request = index.getAll(false);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  // Get completed forms (for syncing)
  async getCompletedForms() {
    if (!IndexDBService.db) {
      await IndexDBService.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = IndexDBService.db.transaction(
        [IndexDBService.storeName],
        "readonly"
      );
      const store = transaction.objectStore(IndexDBService.storeName);
      const index = store.index("isComplete");
      const request = index.getAll(true);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },
};
