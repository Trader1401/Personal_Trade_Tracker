import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  formatCurrency,
  formatPercentage,
  groupTradesByStrategy,
} from "@/lib/calculations";

export default function Analytics() {
  const { trades, isLoading } = useTrades();

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

  const totalPnL = calculateTotalPnL(trades);
  const winRate = calculateWinRate(trades);
  const avgWin = calculateAverageWin(trades);
  const avgLoss = calculateAverageLoss(trades);
  const maxDrawdown = calculateMaxDrawdown(trades);
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

  const strategyGroups = groupTradesByStrategy(trades);
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
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
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
        <PnLChart trades={trades} />
        <WinRateChart trades={trades} />
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <EquityCurve trades={trades} />
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
