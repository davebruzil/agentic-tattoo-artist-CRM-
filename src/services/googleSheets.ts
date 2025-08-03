import type { Client } from '../types/Client';

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY; // Using Firebase API key for Google Sheets
const RANGE = 'Sheet1!A:M';

// Function to extract placement from tattoo description
const extractPlacementFromDescription = (description: string): string => {
  if (!description) return '';
  
  const lowerDesc = description.toLowerCase();
  
  // Hebrew body parts (check specific phrases first, then general parts)
  const hebrewParts = {
    'על הכתף השמאלית': 'כתף שמאלית',
    'על הכתף הימנית': 'כתף ימנית', 
    'על הכתף': 'כתף',
    'על הזרוע': 'זרוע',
    'על הגב': 'גב',
    'על החזה': 'חזה',
    'על הרגל': 'רגל',
    'על היד': 'יד',
    'על הקרסול': 'קרסול',
    'כתף': 'כתף',
    'זרוע': 'זרוע', 
    'גב': 'גב',
    'חזה': 'חזה',
    'רגל': 'רגל',
    'יד': 'יד',
    'קרסול': 'קרסול',
    'פרק כף היד': 'פרק כף היד',
    'צוואר': 'צוואר',
    'בטן': 'בטן',
    'צלע': 'צלע',
    'ירך': 'ירך',
    'שוק': 'שוק',
    'אצבע': 'אצבע',
    'מצח': 'מצח',
    'לחי': 'לחי'
  };
  
  // English body parts
  const englishParts = {
    'shoulder': 'Shoulder',
    'arm': 'Arm',
    'back': 'Back', 
    'chest': 'Chest',
    'leg': 'Leg',
    'hand': 'Hand',
    'ankle': 'Ankle',
    'wrist': 'Wrist',
    'neck': 'Neck',
    'stomach': 'Stomach',
    'belly': 'Belly',
    'rib': 'Rib',
    'thigh': 'Thigh',
    'calf': 'Calf',
    'finger': 'Finger',
    'forearm': 'Forearm',
    'bicep': 'Bicep',
    'tricep': 'Tricep'
  };
  
  // Check Hebrew parts first
  for (const [hebrew, placement] of Object.entries(hebrewParts)) {
    if (lowerDesc.includes(hebrew)) {
      return placement;
    }
  }
  
  // Check English parts
  for (const [english, placement] of Object.entries(englishParts)) {
    if (lowerDesc.includes(english)) {
      return placement;
    }
  }
  
  return '';
};

// Proper CSV parsing function that handles quoted fields with commas
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(currentField.trim());
      currentField = '';
      i++;
    } else {
      // Regular character
      currentField += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(currentField.trim());
  
  return result;
};

// Fetch client data from Google Sheets using public API
export const fetchClientsFromSheets = async (): Promise<Client[]> => {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('Missing Google Sheets ID');
    }

    // Try Google Sheets API first
    if (API_KEY) {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
        console.log('Attempting to fetch from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Google Sheets API Error:', response.status, errorText);
          
          if (response.status === 403) {
            const errorData = JSON.parse(errorText);
            throw new Error(`Google Sheets API access denied: ${errorData.error?.message || 'Unknown error'}. You may need to enable Google Sheets API in Google Cloud Console for your project.`);
          }
          
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const rows = data.values;

        if (!rows || rows.length === 0) {
          console.log('No data found in spreadsheet');
          return [];
        }

        // Skip header row and map data to Client objects
        const clients: Client[] = rows.slice(1).map((row, index) => {
          console.log(`Row ${index + 1}:`, row); // Debug log
          
          const tattooDescription = row[5] || '';
          const manualPlacement = row[6] || '';
          
          console.log(`Tattoo Description (column F):`, tattooDescription); // Debug log
          console.log(`Manual Placement (column G):`, manualPlacement); // Debug log
          
          // Auto-detect placement from tattoo description if manual placement is empty
          const autoPlacement = manualPlacement || extractPlacementFromDescription(tattooDescription);
          console.log(`Auto Placement:`, autoPlacement); // Debug log
          
          return {
            id: (index + 1).toString(),
            name: row[0] || 'Unknown',
            phone: row[1] || '',
            email: row[2] || '',
            instagram: row[3] || undefined,
            tattooDescription, // Tattoo Concept column (F)
            placement: autoPlacement, // Placement column (G) or auto-detected
            size: row[4] || 'Medium', // Size from column E
            budget: row[7] || '',
            status: (row[8] as Client['status']) || 'Consultation',
            nextAppointment: row[9] || '',
          };
        });

        return clients;
      } catch (apiError) {
        console.warn('Google Sheets API failed, trying CSV export:', apiError);
        // Fall back to CSV export
      }
    }

    // Fallback: Try CSV export (works if sheet is public)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;
    console.log('Trying CSV export:', csvUrl);
    
    const csvResponse = await fetch(csvUrl);
    
    if (!csvResponse.ok) {
      console.error('CSV Response status:', csvResponse.status);
      console.error('CSV Response headers:', csvResponse.headers);
      throw new Error(`CSV export failed: ${csvResponse.status}. Make sure the Google Sheet is publicly accessible.`);
    }

    const csvText = await csvResponse.text();
    console.log('CSV Text length:', csvText.length);
    console.log('First 500 chars of CSV:', csvText.substring(0, 500));
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('CSV Lines count:', lines.length);
    console.log('First line (header):', lines[0]);
    
    if (lines.length <= 1) {
      console.log('No data found in CSV');
      return [];
    }

    // Skip header row and map CSV data to Client objects
    const clients: Client[] = lines.slice(1).map((line, index) => {
      // Proper CSV parsing that handles quoted fields with commas
      const row = parseCSVLine(line);
      console.log(`CSV Row ${index + 1}:`, row); // Debug log
      
      const tattooDescription = row[3] || ''; // idea summary is in column D (index 3)
      const manualPlacement = row[5] || ''; // manual placement would be in column F (index 5) if it exists
      
      console.log(`CSV Tattoo Description (column D):`, tattooDescription); // Debug log
      console.log(`CSV Manual Placement (column F):`, manualPlacement); // Debug log
      
      // Auto-detect placement from tattoo description if manual placement is empty
      const autoPlacement = manualPlacement || extractPlacementFromDescription(tattooDescription);
      console.log(`CSV Auto Placement:`, autoPlacement); // Debug log
      
      return {
        id: (index + 1).toString(),
        name: row[0] || 'Unknown', // name
        phone: row[1] || '', // phone number  
        email: '', // not in CSV
        instagram: '', // not in CSV
        tattooDescription, // idea summary from column D
        placement: autoPlacement, // auto-detected from tattoo description
        size: '', // not in CSV, will be manually set
        budget: '', // not in CSV, will be manually set
        status: row[2] === 'consultation' ? 'Consultation' : 'Consultation', // meeting type
        nextAppointment: '', // not in CSV
      };
    });

    return clients;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
};

// Delete client from Google Sheets (requires backend API)
export const deleteClientFromSheets = async (clientId: string): Promise<void> => {
  try {
    // This would need to be implemented as a backend API endpoint
    const response = await fetch('/api/sheets/delete-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete client from sheets');
    }

    console.log('Client deleted from Google Sheets successfully');
  } catch (error) {
    console.error('Error deleting client from Google Sheets:', error);
    throw error;
  }
};

// Note: Adding clients to sheets requires write permissions and service account auth
// For now, this is disabled as it requires backend implementation
export const addClientToSheets = async (client: Omit<Client, 'id'>): Promise<void> => {
  console.log('Adding client to sheets (not implemented in browser):', client);
  throw new Error('Adding clients requires backend implementation');
};