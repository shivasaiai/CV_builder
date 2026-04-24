// Progress Persistence Service

export interface ProgressSnapshot {
  sessionId: string;
  currentSection: number;
  completionPercentage: number;
  sectionStatuses: Record<string, string>;
  timestamp: number;
  version: string;
}

export interface AutoSaveData {
  resumeData: any;
  builderState: any;
  progressSnapshot: ProgressSnapshot;
  lastSaved: number;
}

class ProgressPersistenceService {
  private readonly STORAGE_PREFIX = 'resume_builder_';
  private readonly VERSION = '1.0.0';
  private readonly MAX_AGE_HOURS = 24;

  // Save progress snapshot
  saveProgress(sessionId: string, snapshot: Omit<ProgressSnapshot, 'sessionId' | 'timestamp' | 'version'>): void {
    try {
      const fullSnapshot: ProgressSnapshot = {
        ...snapshot,
        sessionId,
        timestamp: Date.now(),
        version: this.VERSION
      };

      const key = `${this.STORAGE_PREFIX}progress_${sessionId}`;
      localStorage.setItem(key, JSON.stringify(fullSnapshot));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  // Load progress snapshot
  loadProgress(sessionId: string): ProgressSnapshot | null {
    try {
      const key = `${this.STORAGE_PREFIX}progress_${sessionId}`;
      const stored = localStorage.getItem(key);
      
      if (!stored) return null;

      const snapshot: ProgressSnapshot = JSON.parse(stored);
      
      // Check if data is too old
      const ageHours = (Date.now() - snapshot.timestamp) / (1000 * 60 * 60);
      if (ageHours > this.MAX_AGE_HOURS) {
        this.clearProgress(sessionId);
        return null;
      }

      // Check version compatibility
      if (snapshot.version !== this.VERSION) {
        console.warn('Progress data version mismatch, clearing old data');
        this.clearProgress(sessionId);
        return null;
      }

      return snapshot;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }

  // Auto-save functionality
  autoSave(sessionId: string, data: Omit<AutoSaveData, 'lastSaved'>): void {
    try {
      const autoSaveData: AutoSaveData = {
        ...data,
        lastSaved: Date.now()
      };

      const key = `${this.STORAGE_PREFIX}autosave_${sessionId}`;
      localStorage.setItem(key, JSON.stringify(autoSaveData));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  // Load auto-saved data
  loadAutoSave(sessionId: string): AutoSaveData | null {
    try {
      const key = `${this.STORAGE_PREFIX}autosave_${sessionId}`;
      const stored = localStorage.getItem(key);
      
      if (!stored) return null;

      const data: AutoSaveData = JSON.parse(stored);
      
      // Check if auto-save is too old
      const ageHours = (Date.now() - data.lastSaved) / (1000 * 60 * 60);
      if (ageHours > this.MAX_AGE_HOURS) {
        this.clearAutoSave(sessionId);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }

  // Clear progress data
  clearProgress(sessionId: string): void {
    try {
      const key = `${this.STORAGE_PREFIX}progress_${sessionId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  }

  // Clear auto-save data
  clearAutoSave(sessionId: string): void {
    try {
      const key = `${this.STORAGE_PREFIX}autosave_${sessionId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear auto-save:', error);
    }
  }

  // Clear all data for a session
  clearSession(sessionId: string): void {
    this.clearProgress(sessionId);
    this.clearAutoSave(sessionId);
  }

  // Get all stored sessions
  getAllSessions(): string[] {
    try {
      const sessions: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.STORAGE_PREFIX}progress_`)) {
          const sessionId = key.replace(`${this.STORAGE_PREFIX}progress_`, '');
          sessions.push(sessionId);
        }
      }
      return sessions;
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  // Cleanup old data
  cleanup(): void {
    try {
      const sessions = this.getAllSessions();
      const cutoffTime = Date.now() - (this.MAX_AGE_HOURS * 60 * 60 * 1000);

      sessions.forEach(sessionId => {
        const progress = this.loadProgress(sessionId);
        if (progress && progress.timestamp < cutoffTime) {
          this.clearSession(sessionId);
        }
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  // Export progress data (for backup/sharing)
  exportProgress(sessionId: string): string | null {
    try {
      const progress = this.loadProgress(sessionId);
      const autoSave = this.loadAutoSave(sessionId);
      
      if (!progress && !autoSave) return null;

      return JSON.stringify({
        progress,
        autoSave,
        exportedAt: Date.now()
      }, null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }

  // Import progress data
  importProgress(sessionId: string, exportedData: string): boolean {
    try {
      const data = JSON.parse(exportedData);
      
      if (data.progress) {
        const key = `${this.STORAGE_PREFIX}progress_${sessionId}`;
        localStorage.setItem(key, JSON.stringify(data.progress));
      }

      if (data.autoSave) {
        const key = `${this.STORAGE_PREFIX}autosave_${sessionId}`;
        localStorage.setItem(key, JSON.stringify(data.autoSave));
      }

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const progressPersistence = new ProgressPersistenceService();

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  progressPersistence.cleanup();
}