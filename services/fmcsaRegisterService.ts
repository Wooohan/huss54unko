const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface FMCSARegisterEntry {
  id?: string;
  number: string;
  title: string;
  decided: string;
  category: string;
  date_fetched: string;
  extracted_date?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Save FMCSA Register entries via the backend API
 */
export const saveFMCSARegisterEntries = async (
  entries: FMCSARegisterEntry[],
  fetchDate: string,
  extractedDate?: string
): Promise<{ success: boolean; error?: string; count?: number }> => {
  try {
    if (!entries || entries.length === 0) {
      console.log('No entries to save');
      return { success: true, count: 0 };
    }

    const dateToUse = extractedDate || fetchDate;

    const records = entries.map(entry => ({
      number: entry.number,
      title: entry.title,
      decided: entry.decided || 'N/A',
      category: entry.category || 'MISCELLANEOUS',
      date_fetched: fetchDate,
      extracted_date: dateToUse,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log(`Saving ${records.length} entries for date: ${dateToUse}`);

    const response = await fetch(`${BACKEND_URL}/api/fmcsa-register/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: records }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: `Backend error: ${errData.error || response.statusText}` };
    }

    return { success: true, count: records.length };
  } catch (err: any) {
    console.error('Exception saving FMCSA entries:', err);
    return { success: false, error: `Exception: ${err.message}` };
  }
};

/**
 * Fetch FMCSA Register entries by extracted_date
 */
export const fetchFMCSARegisterByExtractedDate = async (
  extractedDate: string,
  filters?: {
    category?: string;
    searchTerm?: string;
  }
): Promise<FMCSARegisterEntry[]> => {
  try {
    const params = new URLSearchParams();
    params.set('extracted_date', extractedDate);
    if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters?.searchTerm) params.set('search', filters.searchTerm);

    const response = await fetch(`${BACKEND_URL}/api/fmcsa-register/entries?${params.toString()}`);
    if (!response.ok) {
      console.error('Backend fetch error:', response.statusText);
      return [];
    }

    const data = await response.json();
    console.log(`Retrieved ${(data || []).length} records for ${extractedDate}`);
    return (data || []) as FMCSARegisterEntry[];
  } catch (err) {
    console.error('Exception fetching FMCSA entries:', err);
    return [];
  }
};

/**
 * Fetch FMCSA Register entries with filters (Legacy/Range Support)
 */
export const fetchFMCSARegisterEntries = async (filters?: {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  limit?: number;
}): Promise<FMCSARegisterEntry[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters?.dateFrom) params.set('date_from', filters.dateFrom);
    if (filters?.dateTo) params.set('date_to', filters.dateTo);
    if (filters?.searchTerm) params.set('search', filters.searchTerm);
    if (filters?.limit) params.set('limit', filters.limit.toString());

    const response = await fetch(`${BACKEND_URL}/api/fmcsa-register/entries?${params.toString()}`);
    if (!response.ok) {
      console.error('Backend fetch error:', response.statusText);
      return [];
    }

    const data = await response.json();
    return (data || []) as FMCSARegisterEntry[];
  } catch (err) {
    console.error('Exception fetching entries:', err);
    return [];
  }
};

/**
 * Get entries for a specific date
 */
export const getFMCSAEntriesByDate = async (date: string): Promise<FMCSARegisterEntry[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/fmcsa-register/entries?extracted_date=${encodeURIComponent(date)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data || []) as FMCSARegisterEntry[];
  } catch (err) {
    console.error('Exception fetching by date:', err);
    return [];
  }
};

/**
 * Get unique categories
 */
export const getFMCSACategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/fmcsa-register/categories`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data || []) as string[];
  } catch (err) {
    console.error('Exception fetching categories:', err);
    return [];
  }
};

/**
 * Get statistics for a date range
 */
export const getFMCSAStatistics = async (
  dateFrom?: string,
  dateTo?: string
): Promise<{
  totalEntries: number;
  byCategory: Record<string, number>;
  dateRange: { from: string; to: string };
}> => {
  try {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);

    const response = await fetch(`${BACKEND_URL}/api/fmcsa-register/statistics?${params.toString()}`);
    if (!response.ok) {
      return { totalEntries: 0, byCategory: {}, dateRange: { from: dateFrom || '', to: dateTo || '' } };
    }

    const data = await response.json();
    return {
      totalEntries: data.totalEntries || 0,
      byCategory: data.byCategory || {},
      dateRange: { from: dateFrom || '', to: dateTo || '' },
    };
  } catch (err) {
    console.error('Exception fetching statistics:', err);
    return { totalEntries: 0, byCategory: {}, dateRange: { from: dateFrom || '', to: dateTo || '' } };
  }
};

/**
 * Get all unique extracted dates
 */
export const getExtractedDates = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/fmcsa-register/dates`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data || []) as string[];
  } catch (err) {
    console.error('Exception fetching dates:', err);
    return [];
  }
};

/**
 * Delete old entries (for cleanup)
 */
export const deleteFMCSAEntriesBeforeDate = async (date: string): Promise<{ success: boolean; error?: string; deleted?: number }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/fmcsa-register?before_date=${encodeURIComponent(date)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || response.statusText };
    }

    const data = await response.json();
    return { success: true, deleted: data.deleted || 0 };
  } catch (err: any) {
    console.error('Exception deleting entries:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Check if FMCSA register data is accessible
 */
export const checkFMCSARegisterTable = async (): Promise<{
  exists: boolean;
  accessible: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/fmcsa-register/dates`);
    if (!response.ok) {
      return { exists: false, accessible: false, error: response.statusText };
    }
    return { exists: true, accessible: true };
  } catch (err: any) {
    return { exists: false, accessible: false, error: err.message };
  }
};
