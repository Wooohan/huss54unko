const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Database types
export interface CarrierRecord {
  id?: string;
  mc_number: string;
  dot_number: string;
  legal_name: string;
  dba_name?: string;
  entity_type: string;
  status: string;
  email?: string;
  phone?: string;
  power_units?: string;
  drivers?: string;
  non_cmv_units?: string;
  physical_address?: string;
  mailing_address?: string;
  date_scraped: string;
  mcs150_date?: string;
  mcs150_mileage?: string;
  operation_classification?: string[];
  carrier_operation?: string[];
  cargo_carried?: string[];
  out_of_service_date?: string;
  state_carrier_id?: string;
  duns_number?: string;
  safety_rating?: string;
  safety_rating_date?: string;
  basic_scores?: any;
  oos_rates?: any;
  insurance_policies?: any;
  inspections?: any;
  crashes?: any;
  created_at?: string;
  updated_at?: string;
}

const carrierToSnakeCase = (carrier: any): CarrierRecord => ({
  mc_number: carrier.mcNumber,
  dot_number: carrier.dotNumber,
  legal_name: carrier.legalName,
  dba_name: carrier.dbaName || null,
  entity_type: carrier.entityType,
  status: carrier.status,
  email: carrier.email || null,
  phone: carrier.phone || null,
  power_units: carrier.powerUnits || null,
  drivers: carrier.drivers || null,
  non_cmv_units: carrier.nonCmvUnits || null,
  physical_address: carrier.physicalAddress || null,
  mailing_address: carrier.mailingAddress || null,
  date_scraped: carrier.dateScraped,
  mcs150_date: carrier.mcs150Date || null,
  mcs150_mileage: carrier.mcs150Mileage || null,
  operation_classification: carrier.operationClassification || [],
  carrier_operation: carrier.carrierOperation || [],
  cargo_carried: carrier.cargoCarried || [],
  out_of_service_date: carrier.outOfServiceDate || null,
  state_carrier_id: carrier.stateCarrierId || null,
  duns_number: carrier.dunsNumber || null,
  safety_rating: carrier.safetyRating || null,
  safety_rating_date: carrier.safetyRatingDate || null,
  basic_scores: carrier.basicScores || null,
  oos_rates: carrier.oosRates || null,
  insurance_policies: carrier.insurancePolicies || null,
  inspections: carrier.inspections || null,
  crashes: carrier.crashes || null,
});

const snakeToCamelCase = (record: any) => ({
  mcNumber: record.mc_number,
  dotNumber: record.dot_number,
  legalName: record.legal_name,
  dbaName: record.dba_name,
  entityType: record.entity_type,
  status: record.status,
  email: record.email,
  phone: record.phone,
  powerUnits: record.power_units,
  drivers: record.drivers,
  non_cmv_units: record.non_cmv_units,
  physicalAddress: record.physical_address,
  mailingAddress: record.mailing_address,
  dateScraped: record.date_scraped,
  mcs150Date: record.mcs150_date,
  mcs150Mileage: record.mcs150_mileage,
  operationClassification: record.operation_classification || [],
  carrierOperation: record.carrier_operation || [],
  cargoCarried: record.cargo_carried || [],
  outOfServiceDate: record.out_of_service_date,
  stateCarrierId: record.state_carrier_id,
  dunsNumber: record.duns_number,
  safetyRating: record.safety_rating,
  safetyRatingDate: record.safety_rating_date,
  basicScores: record.basic_scores,
  oosRates: record.oos_rates,
  insurancePolicies: record.insurance_policies,
  inspections: record.inspections,
  crashes: record.crashes,
});

export const saveCarrierToSupabase = async (
  carrier: any
): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    if (!carrier.mcNumber || !carrier.dotNumber || !carrier.legalName) {
      return {
        success: false,
        error: 'Missing required fields: mcNumber, dotNumber, or legalName',
      };
    }

    const record = carrierToSnakeCase(carrier);

    const response = await fetch(`${BACKEND_URL}/api/carriers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `Backend error: ${errData.error || response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('Carrier saved:', carrier.mcNumber);
    return { success: true, data };
  } catch (err: any) {
    console.error('Exception saving carrier:', err);
    return {
      success: false,
      error: `Exception: ${err.message}`,
    };
  }
};

export const saveCarriersToSupabase = async (
  carriers: any[]
): Promise<{ success: boolean; error?: string; saved: number; failed: number }> => {
  try {
    const records = carriers.map(carrierToSnakeCase);

    const response = await fetch(`${BACKEND_URL}/api/carriers/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carriers: records }),
    });

    if (!response.ok) {
      return { success: false, saved: 0, failed: carriers.length, error: 'Backend batch save failed' };
    }

    const data = await response.json();
    return {
      success: data.success,
      saved: data.saved || 0,
      failed: data.failed || 0,
      error: data.failed > 0 ? `${data.failed} carriers failed to save` : undefined,
    };
  } catch (err: any) {
    console.error('Exception batch saving carriers:', err);
    return { success: false, saved: 0, failed: carriers.length, error: err.message };
  }
};

export interface CarrierFilters {
  mcNumber?: string;
  dotNumber?: string;
  legalName?: string;
  active?: string;
  state?: string;
  hasEmail?: string;
  hasBoc3?: string;
  hasCompanyRep?: string;
  yearsInBusinessMin?: number;
  yearsInBusinessMax?: number;
  classification?: string[];
  carrierOperation?: string[];
  hazmat?: string;
  powerUnitsMin?: number;
  powerUnitsMax?: number;
  driversMin?: number;
  driversMax?: number;
  cargo?: string[];
  insuranceRequired?: string[];
  bipdMin?: number;
  bipdMax?: number;
  bipdOnFile?: string;
  cargoOnFile?: string;
  bondOnFile?: string;
  oosMin?: number;
  oosMax?: number;
  crashesMin?: number;
  crashesMax?: number;
  injuriesMin?: number;
  injuriesMax?: number;
  fatalitiesMin?: number;
  fatalitiesMax?: number;
  towawayMin?: number;
  towawayMax?: number;
  inspectionsMin?: number;
  inspectionsMax?: number;
  limit?: number;
}

export const fetchCarriersFromSupabase = async (filters: CarrierFilters = {}): Promise<any[]> => {
  try {
    const params = new URLSearchParams();

    if (filters.mcNumber) params.set('mc_number', filters.mcNumber);
    if (filters.dotNumber) params.set('dot_number', filters.dotNumber);
    if (filters.legalName) params.set('legal_name', filters.legalName);
    if (filters.active) params.set('active', filters.active);
    if (filters.state) params.set('state', filters.state);
    if (filters.hasEmail) params.set('has_email', filters.hasEmail);
    if (filters.hasBoc3) params.set('has_boc3', filters.hasBoc3);
    if (filters.hasCompanyRep) params.set('has_company_rep', filters.hasCompanyRep);
    if (filters.classification && filters.classification.length > 0) params.set('classification', filters.classification.join(','));
    if (filters.carrierOperation && filters.carrierOperation.length > 0) params.set('carrier_operation', filters.carrierOperation.join(','));
    if (filters.cargo && filters.cargo.length > 0) params.set('cargo', filters.cargo.join(','));
    if (filters.hazmat) params.set('hazmat', filters.hazmat);
    if (filters.powerUnitsMin !== undefined) params.set('power_units_min', filters.powerUnitsMin.toString());
    if (filters.powerUnitsMax !== undefined) params.set('power_units_max', filters.powerUnitsMax.toString());
    if (filters.driversMin !== undefined) params.set('drivers_min', filters.driversMin.toString());
    if (filters.driversMax !== undefined) params.set('drivers_max', filters.driversMax.toString());
    if (filters.insuranceRequired && filters.insuranceRequired.length > 0) params.set('insurance_required', filters.insuranceRequired.join(','));
    if (filters.bipdMin !== undefined) params.set('bipd_min', filters.bipdMin.toString());
    if (filters.bipdMax !== undefined) params.set('bipd_max', filters.bipdMax.toString());
    if (filters.bipdOnFile) params.set('bipd_on_file', filters.bipdOnFile);
    if (filters.cargoOnFile) params.set('cargo_on_file', filters.cargoOnFile);
    if (filters.bondOnFile) params.set('bond_on_file', filters.bondOnFile);
    if (filters.limit) params.set('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `${BACKEND_URL}/api/carriers${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Backend fetch error:', response.statusText);
      return [];
    }

    const data = await response.json();
    const records = Array.isArray(data) ? data : [];

    let results = records.map(snakeToCamelCase);

    // Post-fetch filtering for Years in Business
    if (filters.yearsInBusinessMin !== undefined || filters.yearsInBusinessMax !== undefined) {
      results = results.filter(carrier => {
        if (!carrier.mcs150Date || carrier.mcs150Date === 'N/A') return false;
        try {
          const date = new Date(carrier.mcs150Date);
          if (isNaN(date.getTime())) return false;
          const diffMs = Date.now() - date.getTime();
          const ageDate = new Date(diffMs);
          const years = Math.abs(ageDate.getUTCFullYear() - 1970);

          if (filters.yearsInBusinessMin !== undefined && years < filters.yearsInBusinessMin) return false;
          if (filters.yearsInBusinessMax !== undefined && years > filters.yearsInBusinessMax) return false;
          return true;
        } catch (e) {
          return false;
        }
      });
    }

    // Post-fetch filtering for Safety Metrics
    if (
      filters.oosMin !== undefined || filters.oosMax !== undefined ||
      filters.crashesMin !== undefined || filters.crashesMax !== undefined ||
      filters.injuriesMin !== undefined || filters.injuriesMax !== undefined ||
      filters.fatalitiesMin !== undefined || filters.fatalitiesMax !== undefined ||
      filters.towawayMin !== undefined || filters.towawayMax !== undefined ||
      filters.inspectionsMin !== undefined || filters.inspectionsMax !== undefined
    ) {
      results = results.filter(carrier => {
        if (filters.oosMin !== undefined || filters.oosMax !== undefined) {
          let oosCount = 0;
          if (carrier.inspections && Array.isArray(carrier.inspections)) {
            oosCount = carrier.inspections.reduce((sum: number, inspection: any) => sum + (inspection.oosViolations || 0), 0);
          }
          if (filters.oosMin !== undefined && oosCount < filters.oosMin) return false;
          if (filters.oosMax !== undefined && oosCount > filters.oosMax) return false;
        }

        if (filters.crashesMin !== undefined || filters.crashesMax !== undefined) {
          const crashCount = (carrier.crashes && Array.isArray(carrier.crashes)) ? carrier.crashes.length : 0;
          if (filters.crashesMin !== undefined && crashCount < filters.crashesMin) return false;
          if (filters.crashesMax !== undefined && crashCount > filters.crashesMax) return false;
        }

        if (filters.injuriesMin !== undefined || filters.injuriesMax !== undefined) {
          let injuryCount = 0;
          if (carrier.crashes && Array.isArray(carrier.crashes)) {
            injuryCount = carrier.crashes.reduce((sum: number, crash: any) => {
              const injuries = parseInt(crash.injuries || '0');
              return sum + (isNaN(injuries) ? 0 : injuries);
            }, 0);
          }
          if (filters.injuriesMin !== undefined && injuryCount < filters.injuriesMin) return false;
          if (filters.injuriesMax !== undefined && injuryCount > filters.injuriesMax) return false;
        }

        if (filters.fatalitiesMin !== undefined || filters.fatalitiesMax !== undefined) {
          let fatalityCount = 0;
          if (carrier.crashes && Array.isArray(carrier.crashes)) {
            fatalityCount = carrier.crashes.reduce((sum: number, crash: any) => {
              const fatals = parseInt(crash.fatal || '0');
              return sum + (isNaN(fatals) ? 0 : fatals);
            }, 0);
          }
          if (filters.fatalitiesMin !== undefined && fatalityCount < filters.fatalitiesMin) return false;
          if (filters.fatalitiesMax !== undefined && fatalityCount > filters.fatalitiesMax) return false;
        }

        if (filters.towawayMin !== undefined || filters.towawayMax !== undefined) {
          let towawayCount = 0;
          if (carrier.crashes && Array.isArray(carrier.crashes)) {
            towawayCount = carrier.crashes.length;
          }
          if (filters.towawayMin !== undefined && towawayCount < filters.towawayMin) return false;
          if (filters.towawayMax !== undefined && towawayCount > filters.towawayMax) return false;
        }

        if (filters.inspectionsMin !== undefined || filters.inspectionsMax !== undefined) {
          const inspectionCount = (carrier.inspections && Array.isArray(carrier.inspections)) ? carrier.inspections.length : 0;
          if (filters.inspectionsMin !== undefined && inspectionCount < filters.inspectionsMin) return false;
          if (filters.inspectionsMax !== undefined && inspectionCount > filters.inspectionsMax) return false;
        }

        return true;
      });
    }

    return results;
  } catch (err) {
    console.error('Exception fetching carriers:', err);
    return [];
  }
};

export const deleteCarrier = async (
  mcNumber: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/carriers/${encodeURIComponent(mcNumber)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || response.statusText };
    }

    console.log('Carrier deleted:', mcNumber);
    return { success: true };
  } catch (err: any) {
    console.error('Exception deleting carrier:', err);
    return { success: false, error: err.message };
  }
};

export const getCarrierCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/carriers/count`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count || 0;
  } catch (err) {
    console.error('Exception getting carrier count:', err);
    return 0;
  }
};

export const updateCarrierInsurance = async (dotNumber: string, insuranceData: any): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/carriers/${encodeURIComponent(dotNumber)}/insurance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policies: insuranceData.policies }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || response.statusText };
    }

    console.log('Insurance data updated for DOT:', dotNumber);
    return { success: true };
  } catch (err: any) {
    console.error('Exception updating insurance:', err);
    return { success: false, error: err.message };
  }
};

export const updateCarrierSafety = async (dotNumber: string, safetyData: any): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/carriers/${encodeURIComponent(dotNumber)}/safety`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safetyData),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || response.statusText };
    }

    console.log('Safety data updated for DOT:', dotNumber);
    return { success: true };
  } catch (err: any) {
    console.error('Exception updating safety data:', err);
    return { success: false, error: err.message };
  }
};

export const getCarriersByMCRange = async (start: string, end: string): Promise<any[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/carriers/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
    if (!response.ok) return [];
    const data = await response.json();
    const records = Array.isArray(data) ? data : [];

    return records.map(record => ({
      mcNumber: record.mc_number,
      dotNumber: record.dot_number,
      legalName: record.legal_name,
      insurancePolicies: record.insurance_policies || []
    }));
  } catch (err) {
    console.error('Error fetching MC range:', err);
    return [];
  }
};
