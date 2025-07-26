import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Calendar, TrendingUp, TrendingDown, Target, Brain } from "lucide-react";
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
import { usePsychology } from "@/hooks/use-psychology";
import { useTrades } from "@/hooks/use-trades";
import { calculateTotalPnL, formatCurrency } from "@/lib/calculations";

const psychologySchema = z.object({
  month: z.string().min(1, "Month is required"),
  year: z.coerce.number().min(2020).max(2030),
  monthlyPnL: z.coerce.number().optional(),
  bestTradeId: z.coerce.number().optional(),
  worstTradeId: z.coerce.number().optional(),
  mentalReflections: z.string().min(10, "Please provide detailed mental reflections"),
  improvementAreas: z.string().min(10, "Please identify specific improvement areas"),
});

type PsychologyForm = z.infer<typeof psychologySchema>;

export default function PsychologyEnhanced() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { entries: psychologyEntries, addEntry: addPsychologyEntry, isAdding, isLoading } = usePsychology();
  const { trades } = useTrades();
  const { toast } = useToast();

  const form = useForm<PsychologyForm>({
    resolver: zodResolver(psychologySchema),
    defaultValues: {
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      monthlyPnL: 0,
      bestTradeId: 0,
      worstTradeId: 0,
      mentalReflections: "",
      improvementAreas: "",
    },
  });

  const onSubmit = async (data: PsychologyForm) => {
    try {
      await addPsychologyEntry({
        month: data.month,
        year: data.year,
        monthlyPnL: data.monthlyPnL?.toString(),
        bestTradeId: data.bestTradeId,
        worstTradeId: data.worstTradeId,
        mentalReflections: data.mentalReflections,
        improvementAreas: data.improvementAreas,
      });

      form.reset();
      setIsAddDialogOpen(false);
      
      // Show success message
      toast({
        title: "Psychology Entry Added!",
        description: `${data.month} ${data.year} psychology entry saved successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to add psychology entry:', error);
      toast({
        title: "Error Adding Entry",
        description: "Failed to save psychology entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get current month's statistics
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const currentMonthTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.tradeDate);
    return tradeDate.getMonth() === new Date().getMonth() && 
           tradeDate.getFullYear() === currentYear;
  });
  const currentMonthPnL = calculateTotalPnL(currentMonthTrades);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Psychology Entry</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" min="2020" max="2030" {...field} />
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
                        <FormLabel>Monthly P&L</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder={currentMonthPnL.toString()}
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
                            {currentMonthTrades
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
                            {currentMonthTrades
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
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? "Adding..." : "Add Entry"}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {currentMonth} {currentYear}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              {currentMonthPnL >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly P&L</p>
                <p className={`text-2xl font-bold ${
                  currentMonthPnL >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(currentMonthPnL)}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trades This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {currentMonthTrades.length}
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
                .sort((a: any, b: any) => b.year - a.year || months.indexOf(b.month) - months.indexOf(a.month))
                .map((entry: any) => (
                  <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-sm">
                          {entry.month} {entry.year}
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
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(entry.createdAt).toLocaleDateString()}
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