import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Psychology Entry type
export interface PsychologyEntry {
  id: number;
  month: string;
  year: number;
  monthlyPnL: string | null;
  bestTradeId: number | null;
  worstTradeId: number | null;  
  mentalReflections: string;
  improvementAreas: string;
  createdAt: Date;
}

// Insert schema type
export interface InsertPsychologyEntry {
  month: string;
  year: number;
  monthlyPnL?: string;
  bestTradeId?: number;
  worstTradeId?: number;
  mentalReflections: string;
  improvementAreas: string;
}

export function usePsychologyEntries() {
  return useQuery({
    queryKey: ['/api/psychology-entries'],
    queryFn: async (): Promise<PsychologyEntry[]> => {
      const response = await fetch('/api/psychology-entries');
      if (!response.ok) {
        throw new Error('Failed to fetch psychology entries');
      }
      const data = await response.json();
      return data.data || [];
    },
  });
}

export function useAddPsychologyEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entry: InsertPsychologyEntry): Promise<PsychologyEntry> => {
      const response = await fetch('/api/psychology-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add psychology entry');
      }
      
      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/psychology-entries'] });
    },
  });
}

export function usePsychology() {
  const { data: entries = [], isLoading } = usePsychologyEntries();
  const addEntryMutation = useAddPsychologyEntry();

  return {
    entries,
    isLoading,
    addEntry: addEntryMutation.mutateAsync, // Use mutateAsync for promise-based handling
    isAdding: addEntryMutation.isPending,
  };
}