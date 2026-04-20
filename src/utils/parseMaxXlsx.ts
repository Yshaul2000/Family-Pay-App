import * as XLSX from 'xlsx';
import type { Transaction } from '../types';

export interface ParsedRow {
  storeName: string;
  amount: number;
  date: string;       // YYYY-MM-DD
  category: Transaction['category'];
  lastFour: string;   // 4 digits from card column
}

// Map MAX category strings to app categories
function mapCategory(maxCategory: string): Transaction['category'] {
  const c = maxCategory ?? '';
  if (c.includes('מזון') || c.includes('מסעד') || c.includes('סופר') || c.includes('קפה')) return 'מזון ומשקאות';
  if (c.includes('תחבורה') || c.includes('דלק') || c.includes('רכב') || c.includes('חניה')) return 'תחבורה';
  if (c.includes('קניות') || c.includes('אלקטרוניקה') || c.includes('ביגוד')) return 'קניות';
  if (c.includes('בריאות') || c.includes('רפואה') || c.includes('פארם') || c.includes('רופא')) return 'בריאות';
  return 'אחר';
}

// Convert DD-MM-YYYY or DD/MM/YYYY to YYYY-MM-DD
function parseDate(raw: string | number): string {
  if (typeof raw === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(raw);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  const s = String(raw).trim();
  // DD-MM-YYYY or DD/MM/YYYY
  const match = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return s;
}

export function parseMaxXlsx(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert to array of arrays (RTL file — column A is rightmost visually but index 0 in data)
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        const results: ParsedRow[] = [];

        // Rows 0-3 are metadata/headers — start from row 4 (index 4)
        for (let i = 4; i < rows.length; i++) {
          const row = rows[i] as string[];

          // Stop at summary row
          const firstCell = String(row[0] ?? '').trim();
          if (!firstCell || firstCell.includes('סך') || firstCell.includes('סה')) break;

          const dateRaw = row[0];
          const storeName = String(row[1] ?? '').trim();
          const category = String(row[2] ?? '').trim();
          const lastFour = String(row[3] ?? '').trim();
          const amountRaw = row[5]; // column F (index 5)

          if (!storeName || !amountRaw) continue;

          const amount = parseFloat(String(amountRaw).replace(/[^\d.]/g, ''));
          if (isNaN(amount) || amount <= 0) continue;

          results.push({
            storeName,
            amount,
            date: parseDate(dateRaw as string | number),
            category: mapCategory(category),
            lastFour: lastFour.replace(/\D/g, '').slice(-4),
          });
        }

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
