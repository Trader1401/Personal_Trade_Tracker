import { Trade, Strategy, PsychologyEntry } from "@shared/schema";

export class GoogleSheetsAPI {
  private scriptUrl: string;
  private sheetId: string;

  constructor(scriptUrl: string, sheetId: string) {
    this.scriptUrl = scriptUrl;
    this.sheetId = sheetId;
  }

  private async makeRequest(action: string, data?: any) {
    try {
      // In production (static build), use JSONP to avoid CORS issues
      // In development, route through backend to avoid CORS issues
      const isProduction = import.meta.env.PROD;
      
      if (isProduction) {
        // Use JSONP for production to avoid CORS issues
        return new Promise((resolve, reject) => {
          const callbackName = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Create callback function
          (window as any)[callbackName] = (result: any) => {
            delete (window as any)[callbackName];
            document.body.removeChild(script);
            
            if (result.error) {
              reject(new Error(result.error));
            } else {
              resolve(result.data || result);
            }
          };
          
          // Create script element for JSONP
          const script = document.createElement('script');
          const params = new URLSearchParams({
            action,
            data: JSON.stringify(data || {}),
            callback: callbackName
          });
          
          script.src = `${this.scriptUrl}?${params.toString()}`;
          script.onerror = () => {
            delete (window as any)[callbackName];
            document.body.removeChild(script);
            reject(new Error('JSONP request failed'));
          };
          
          document.body.appendChild(script);
          
          // Timeout after 30 seconds
          setTimeout(() => {
            if ((window as any)[callbackName]) {
              delete (window as any)[callbackName];
              if (document.body.contains(script)) {
                document.body.removeChild(script);
              }
              reject(new Error('Request timeout'));
            }
          }, 30000);
        });
      } else {
        // Development mode - route through backend
        const response = await fetch("/api/google-sheets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            data,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }

        return result.data || result;
      }
    } catch (error) {
      console.error("Google Sheets API error:", error);
      throw error;
    }
  }

  // Trades
  async getTrades(): Promise<Trade[]> {
    return this.makeRequest("getTrades");
  }

  async addTrade(trade: Omit<Trade, "id" | "createdAt">): Promise<Trade> {
    return this.makeRequest("addTrade", trade);
  }

  async updateTrade(id: number, trade: Partial<Trade>): Promise<Trade> {
    return this.makeRequest("updateTrade", { id, ...trade });
  }

  async deleteTrade(id: number): Promise<void> {
    return this.makeRequest("deleteTrade", { id });
  }

  async getTradesByDate(date: string): Promise<Trade[]> {
    return this.makeRequest("getTradesByDate", { date });
  }

  // Strategies
  async getStrategies(): Promise<Strategy[]> {
    return this.makeRequest("getStrategies");
  }

  async addStrategy(strategy: Omit<Strategy, "id" | "createdAt">): Promise<Strategy> {
    return this.makeRequest("addStrategy", strategy);
  }

  async updateStrategy(id: number, strategy: Partial<Strategy>): Promise<Strategy> {
    return this.makeRequest("updateStrategy", { id, ...strategy });
  }

  async deleteStrategy(id: number): Promise<void> {
    return this.makeRequest("deleteStrategy", { id });
  }

  // Psychology Entries
  async getPsychologyEntries(): Promise<PsychologyEntry[]> {
    return this.makeRequest("getPsychologyEntries");
  }

  async addPsychologyEntry(entry: Omit<PsychologyEntry, "id" | "createdAt">): Promise<PsychologyEntry> {
    return this.makeRequest("addPsychologyEntry", entry);
  }

  async updatePsychologyEntry(id: number, entry: Partial<PsychologyEntry>): Promise<PsychologyEntry> {
    return this.makeRequest("updatePsychologyEntry", { id, ...entry });
  }

  async deletePsychologyEntry(id: number): Promise<void> {
    return this.makeRequest("deletePsychologyEntry", { id });
  }
}
