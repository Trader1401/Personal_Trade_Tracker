import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import PnLChart from "@/components/charts/pnl-chart";
import WinRateChart from "@/components/charts/win-rate-chart";
import EquityCurve from "@/components/charts/equity-curve";
import { useTrades } from "@/hooks/use-trades";
import {
  calculateTotalPnL,
  calculateWinRate,
  calculateAverageWin,
  calculateAverageLoss,
  calculateMaxDrawdown,
  calculateProfitFactor,
  formatCurrency,
  formatPercentage,
  groupTradesByStrategy,
} from "@/lib/calculations";

export default function Analytics() {
  const { trades, isLoading } = useTrades();
  const [timeRange, setTimeRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Filter trades based on selected time range
  const filteredTrades = useMemo(() => {
    if (timeRange === "all") return trades;
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "custom":
        if (!customStartDate || !customEndDate) return trades;
        return trades.filter(trade => {
          const tradeDate = new Date(trade.tradeDate);
          return tradeDate >= new Date(customStartDate) && tradeDate <= new Date(customEndDate);
        });
      default:
        return trades;
    }
    
    return trades.filter(trade => new Date(trade.tradeDate) >= startDate);
  }, [trades, timeRange, customStartDate, customEndDate]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  const totalPnL = calculateTotalPnL(filteredTrades);
  const winRate = calculateWinRate(filteredTrades);
  const avgWin = calculateAverageWin(filteredTrades);
  const avgLoss = calculateAverageLoss(filteredTrades);
  const maxDrawdown = calculateMaxDrawdown(filteredTrades);
  const profitFactor = calculateProfitFactor(filteredTrades);

  const strategyGroups = groupTradesByStrategy(filteredTrades);
  const strategyPerformance = Object.entries(strategyGroups).map(([strategy, strategyTrades]) => ({
    strategy,
    trades: strategyTrades.length,
    pnl: calculateTotalPnL(strategyTrades),
    winRate: calculateWinRate(strategyTrades),
  }));

  const metrics = [
    {
      title: "Total P&L",
      value: formatCurrency(totalPnL),
      color: totalPnL >= 0 ? "text-profit" : "text-loss",
    },
    {
      title: "Win Rate",
      value: formatPercentage(winRate),
      color: "text-gray-900",
    },
    {
      title: "Profit Factor",
      value: profitFactor.toFixed(2),
      color: profitFactor >= 1.5 ? "text-profit" : profitFactor >= 1 ? "text-warning" : "text-loss",
    },
    {
      title: "Max Drawdown",
      value: formatCurrency(maxDrawdown),
      color: "text-loss",
    },
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Comprehensive trading performance analysis</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select defaultValue="all" onValueChange={(value) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {timeRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                placeholder="Start Date"
                className="w-36 text-gray-900 dark:text-gray-100 cursor-pointer"
                max={new Date().toISOString().split('T')[0]}
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                placeholder="End Date"
                className="w-36 text-gray-900 dark:text-gray-100 cursor-pointer"
                min={customStartDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">{metric.title}</p>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PnLChart trades={filteredTrades} />
        <WinRateChart trades={filteredTrades} />
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <EquityCurve trades={filteredTrades} />
      </div>

      {/* Strategy Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {strategyPerformance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No strategy data available</p>
              <p className="text-sm">Add strategies to your trades to see performance breakdown</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Strategy</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trades</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Win Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {strategyPerformance.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.strategy}</td>
                      <td className="py-3 px-4">{item.trades}</td>
                      <td className="py-3 px-4">{formatPercentage(item.winRate)}</td>
                      <td className={`py-3 px-4 font-medium ${item.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(item.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Trade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Winning Trades</span>
                <span className="font-medium text-profit">
                  {trades.filter(t => parseFloat(t.profitLoss?.toString() || "0") > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Losing Trades</span>
                <span className="font-medium text-loss">
                  {trades.filter(t => parseFloat(t.profitLoss?.toString() || "0") < 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Win</span>
                <span className="font-medium text-profit">{formatCurrency(avgWin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Loss</span>
                <span className="font-medium text-loss">{formatCurrency(avgLoss)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Trades</span>
                <span className="font-medium">{trades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Factor</span>
                <span className={`font-medium ${profitFactor >= 1.5 ? 'text-profit' : profitFactor >= 1 ? 'text-warning' : 'text-loss'}`}>
                  {profitFactor.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Drawdown</span>
                <span className="font-medium text-loss">{formatCurrency(maxDrawdown)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Best Trade</span>
                <span className="font-medium text-profit">
                  {formatCurrency(Math.max(...trades.map(t => parseFloat(t.profitLoss?.toString() || "0"))))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
