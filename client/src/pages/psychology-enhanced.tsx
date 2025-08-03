import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Calendar, TrendingUp, TrendingDown, Target, Brain, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePsychology, useUpdatePsychologyEntry, useDeletePsychologyEntry } from "@/hooks/use-psychology";
import { useTrades } from "@/hooks/use-trades";
import { calculateTotalPnL, formatCurrency } from "@/lib/calculations";

const psychologySchema = z.object({
  entryDate: z.string().min(1, "Entry date is required"),
  monthlyPnL: z.coerce.number().optional(),
  bestTradeId: z.coerce.number().optional(),
  worstTradeId: z.coerce.number().optional(),
  mentalReflections: z.string().min(10, "Please provide detailed mental reflections"),
  improvementAreas: z.string().min(10, "Please identify specific improvement areas"),
});

type PsychologyForm = z.infer<typeof psychologySchema>;

export default function PsychologyEnhanced() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const { entries: psychologyEntries, addEntry: addPsychologyEntry, isAdding, isLoading } = usePsychology();
  const updateEntryMutation = useUpdatePsychologyEntry();
  const deleteEntryMutation = useDeletePsychologyEntry();
  const { trades } = useTrades();
  const { toast } = useToast();

  const form = useForm<PsychologyForm>({
    resolver: zodResolver(psychologySchema),
    defaultValues: {
      entryDate: new Date().toISOString().split('T')[0],
      monthlyPnL: 0,
      bestTradeId: 0,
      worstTradeId: 0,
      mentalReflections: "",
      improvementAreas: "",
    },
  });

  const onSubmit = async (data: PsychologyForm) => {
    try {
      if (selectedEntry) {
        // Update existing entry
        await updateEntryMutation.mutateAsync({
          id: selectedEntry.id,
          entryDate: data.entryDate,
          monthlyPnL: data.monthlyPnL?.toString(),
          bestTradeId: data.bestTradeId,
          worstTradeId: data.worstTradeId,
          mentalReflections: data.mentalReflections,
          improvementAreas: data.improvementAreas,
        });
        
        toast({
          title: "Psychology Entry Updated!",
          description: `Entry for ${data.entryDate} updated successfully.`,
        });
        
        setSelectedEntry(null);
        setIsEditDialogOpen(false);
      } else {
        // Add new entry
        await addPsychologyEntry({
          entryDate: data.entryDate,
          monthlyPnL: data.monthlyPnL?.toString(),
          bestTradeId: data.bestTradeId,
          worstTradeId: data.worstTradeId,
          mentalReflections: data.mentalReflections,
          improvementAreas: data.improvementAreas,
        });
        
        toast({
          title: "Psychology Entry Added!",
          description: `Entry for ${data.entryDate} saved successfully.`,
        });
        
        setIsAddDialogOpen(false);
      }

      form.reset();
    } catch (error) {
      console.error('Failed to save psychology entry:', error);
      toast({
        title: "Error Saving Entry",
        description: "Failed to save psychology entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: any) => {
    setSelectedEntry(entry);
    form.reset({
      entryDate: entry.entryDate,
      monthlyPnL: entry.monthlyPnL ? parseFloat(entry.monthlyPnL) : 0,
      bestTradeId: entry.bestTradeId,
      worstTradeId: entry.worstTradeId,
      mentalReflections: entry.mentalReflections,
      improvementAreas: entry.improvementAreas,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this psychology entry?')) {
      try {
        await deleteEntryMutation.mutateAsync(id);
        toast({
          title: "Entry Deleted",
          description: "Psychology entry deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete psychology entry.",
          variant: "destructive",
        });
      }
    }
  };

  // Get current month's statistics
  const today = new Date().toISOString().split('T')[0];
  const todaysTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.tradeDate);
    return trade.tradeDate === today;
  });
  const todaysPnL = calculateTotalPnL(todaysTrades);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Psychology Journal</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your mental state and trading psychology</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedEntry(null);
              form.reset();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedEntry ? "Edit Psychology Entry" : "Add Psychology Entry"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="entryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="monthlyPnL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily P&L</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder={todaysPnL.toString()}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bestTradeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Best Trade ID (Optional)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select best trade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {todaysTrades
                              .filter(trade => parseFloat(trade.profitLoss || "0") > 0)
                              .sort((a, b) => parseFloat(b.profitLoss || "0") - parseFloat(a.profitLoss || "0"))
                              .slice(0, 10)
                              .map(trade => (
                                <SelectItem key={trade.id} value={trade.id.toString()}>
                                  {trade.stockName} - {formatCurrency(parseFloat(trade.profitLoss || "0"))}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="worstTradeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Worst Trade ID (Optional)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select worst trade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {todaysTrades
                              .filter(trade => parseFloat(trade.profitLoss || "0") < 0)
                              .sort((a, b) => parseFloat(a.profitLoss || "0") - parseFloat(b.profitLoss || "0"))
                              .slice(0, 10)
                              .map(trade => (
                                <SelectItem key={trade.id} value={trade.id.toString()}>
                                  {trade.stockName} - {formatCurrency(parseFloat(trade.profitLoss || "0"))}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="mentalReflections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mental Reflections</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How did you feel during trades this month? What emotions dominated? What mental patterns did you notice?"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="improvementAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Improvement Areas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What specific areas need improvement? What habits or behaviors do you want to change?"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setIsEditDialogOpen(false);
                      setSelectedEntry(null);
                    }}
                    disabled={isAdding || updateEntryMutation.isPending}
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAdding || updateEntryMutation.isPending}>
                    {(isAdding || updateEntryMutation.isPending) ? "Saving..." : (selectedEntry ? "Update Entry" : "Add Entry")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Psychology Entry</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="entryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="monthlyPnL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily P&L</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="mentalReflections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mental Reflections</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How did you feel during trades today? What emotions dominated?"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="improvementAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Improvement Areas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What specific areas need improvement today?"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedEntry(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateEntryMutation.isPending}>
                    {updateEntryMutation.isPending ? "Updating..." : "Update Entry"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Month Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Date</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Date().toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              {todaysPnL >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's P&L</p>
                <p className={`text-2xl font-bold ${
                  todaysPnL >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(todaysPnL)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trades Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {todaysTrades.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Psychology Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Psychology Entries ({psychologyEntries.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading entries...</p>
            </div>
          ) : psychologyEntries.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No psychology entries yet. Start documenting your mental journey.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                Add Your First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {psychologyEntries
                .sort((a: any, b: any) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
                .map((entry: any) => (
                  <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-sm">
                          {new Date(entry.entryDate).toLocaleDateString('en-IN')}
                        </Badge>
                        {entry.monthlyPnL && (
                          <div className={`text-sm font-semibold ${
                            parseFloat(entry.monthlyPnL) >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatCurrency(parseFloat(entry.monthlyPnL))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleteEntryMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Mental Reflections
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {entry.mentalReflections}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Improvement Areas
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {entry.improvementAreas}
                        </p>
                      </div>
                      
                      {(entry.bestTradeId || entry.worstTradeId) && (
                        <>
                          <Separator />
                          <div className="flex space-x-4">
                            {entry.bestTradeId && (
                              <div>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  Best Trade: #{entry.bestTradeId}
                                </span>
                              </div>
                            )}
                            {entry.worstTradeId && (
                              <div>
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                  Worst Trade: #{entry.worstTradeId}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}