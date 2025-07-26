import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PsychologyEntry } from "@shared/schema";
import { GoogleSheetsAPI } from "@/lib/google-sheets";
import { useAppContext } from "@/contexts/app-context";
import { useToast } from "@/hooks/use-toast";

export function usePsychologyEntries() {
  const { settings } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const api = settings ? new GoogleSheetsAPI(settings.googleScriptUrl || "", settings.googleSheetId || "") : null;

  const query = useQuery({
    queryKey: ["psychologyEntries"],
    queryFn: async () => {
      if (!api) throw new Error("Google Sheets not configured");
      return api.getPsychologyEntries();
    },
    enabled: !!api,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addPsychologyEntryMutation = useMutation({
    mutationFn: async (entry: Omit<PsychologyEntry, "id" | "createdAt">) => {
      if (!api) throw new Error("Google Sheets not configured");
      return api.addPsychologyEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychologyEntries"] });
      toast({
        title: "Success",
        description: "Psychology entry added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePsychologyEntryMutation = useMutation({
    mutationFn: async ({ id, ...entry }: { id: number } & Partial<PsychologyEntry>) => {
      if (!api) throw new Error("Google Sheets not configured");
      return api.updatePsychologyEntry(id, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychologyEntries"] });
      toast({
        title: "Success",
        description: "Psychology entry updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePsychologyEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!api) throw new Error("Google Sheets not configured");
      return api.deletePsychologyEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychologyEntries"] });
      toast({
        title: "Success",
        description: "Psychology entry deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    psychologyEntries: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addPsychologyEntry: addPsychologyEntryMutation.mutate,
    updatePsychologyEntry: updatePsychologyEntryMutation.mutate,
    deletePsychologyEntry: deletePsychologyEntryMutation.mutate,
    isAdding: addPsychologyEntryMutation.isPending,
    isUpdating: updatePsychologyEntryMutation.isPending,
    isDeleting: deletePsychologyEntryMutation.isPending,
  };
}