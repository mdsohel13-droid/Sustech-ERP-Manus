import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ArrowRightLeft, Globe, TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";

const EXCHANGE_RATES: Record<string, { rate: number; change24h: number; name: string }> = {
  "USD": { rate: 1.00, change24h: 0, name: "US Dollar" },
  "BDT": { rate: 110.25, change24h: 0.12, name: "Bangladeshi Taka" },
  "EUR": { rate: 0.92, change24h: -0.08, name: "Euro" },
  "GBP": { rate: 0.79, change24h: -0.15, name: "British Pound" },
  "INR": { rate: 83.45, change24h: 0.05, name: "Indian Rupee" },
  "CNY": { rate: 7.24, change24h: 0.02, name: "Chinese Yuan" },
  "JPY": { rate: 149.80, change24h: 0.22, name: "Japanese Yen" },
  "AED": { rate: 3.67, change24h: 0.0, name: "UAE Dirham" },
  "SAR": { rate: 3.75, change24h: 0.0, name: "Saudi Riyal" },
  "SGD": { rate: 1.34, change24h: -0.03, name: "Singapore Dollar" },
  "MYR": { rate: 4.47, change24h: 0.08, name: "Malaysian Ringgit" },
};

const RATE_HISTORY = [
  { date: "Jan", USDBDT: 109.5, USDEUR: 0.93, USDGBP: 0.80 },
  { date: "Feb", USDBDT: 109.8, USDEUR: 0.92, USDGBP: 0.79 },
  { date: "Mar", USDBDT: 110.0, USDEUR: 0.92, USDGBP: 0.79 },
  { date: "Apr", USDBDT: 110.1, USDEUR: 0.91, USDGBP: 0.78 },
  { date: "May", USDBDT: 110.2, USDEUR: 0.92, USDGBP: 0.79 },
  { date: "Jun", USDBDT: 110.25, USDEUR: 0.92, USDGBP: 0.79 },
];

export default function MultiCurrencyTab() {
  const { currency } = useCurrency();
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("BDT");
  const [convertAmount, setConvertAmount] = useState("1000");
  const [lastRefresh] = useState(new Date());

  const convertedAmount = useMemo(() => {
    const amount = parseFloat(convertAmount) || 0;
    const fromRate = EXCHANGE_RATES[fromCurrency]?.rate || 1;
    const toRate = EXCHANGE_RATES[toCurrency]?.rate || 1;
    return (amount / fromRate) * toRate;
  }, [convertAmount, fromCurrency, toCurrency]);

  const rateChartData = Object.entries(EXCHANGE_RATES)
    .filter(([code]) => code !== "USD")
    .map(([code, data]) => ({
      name: code,
      rate: data.rate,
      change: data.change24h,
      fill: data.change24h >= 0 ? '#10b981' : '#ef4444'
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d2137]">Multi-Currency Management</h2>
          <p className="text-muted-foreground">Live exchange rates and currency conversion</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Rates
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {[
          { code: "USD", icon: "🇺🇸" },
          { code: "BDT", icon: "🇧🇩" },
          { code: "EUR", icon: "🇪🇺" },
          { code: "GBP", icon: "🇬🇧" },
        ].map(({ code, icon }) => {
          const data = EXCHANGE_RATES[code];
          return (
            <Card key={code} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">{data.name}</p>
                    <p className="text-lg font-bold text-[#0d2137]">1 USD = {data.rate.toFixed(2)} {code}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {data.change24h >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                      <span className={`text-xs font-medium ${data.change24h >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {data.change24h >= 0 ? '+' : ''}{data.change24h}%
                      </span>
                      <span className="text-[10px] text-slate-400">24h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#0d3b66]" />
              Currency Converter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-3 items-end">
              <div className="col-span-2">
                <Label className="text-xs text-slate-500">From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(EXCHANGE_RATES).map(code => (
                      <SelectItem key={code} value={code}>{code} - {EXCHANGE_RATES[code].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); }}>
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-slate-500">To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(EXCHANGE_RATES).map(code => (
                      <SelectItem key={code} value={code}>{code} - {EXCHANGE_RATES[code].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Amount</Label>
              <Input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} className="text-lg font-bold" />
            </div>
            <div className="bg-gradient-to-r from-[#0d3b66]/5 to-[#0ea5e9]/5 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500">Converted Amount</p>
              <p className="text-3xl font-extrabold text-[#0d2137]">{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}</p>
              <p className="text-xs text-slate-400 mt-1">
                Rate: 1 {fromCurrency} = {((EXCHANGE_RATES[toCurrency]?.rate || 1) / (EXCHANGE_RATES[fromCurrency]?.rate || 1)).toFixed(4)} {toCurrency}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Exchange Rate Trend (USD/BDT)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={RATE_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="USDBDT" stroke="#0d3b66" strokeWidth={2.5} dot={{ r: 4, fill: '#0d3b66' }} name="USD/BDT" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#0d3b66]" />
            All Exchange Rates (Base: USD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Rate (vs USD)</TableHead>
                <TableHead className="text-right">24h Change</TableHead>
                <TableHead className="text-right">Equivalent in {currency}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(EXCHANGE_RATES).map(([code, data]) => (
                <TableRow key={code}>
                  <TableCell className="font-medium">{data.name}</TableCell>
                  <TableCell><Badge variant="outline">{code}</Badge></TableCell>
                  <TableCell className="text-right font-mono">{data.rate.toFixed(4)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${data.change24h >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {data.change24h >= 0 ? '+' : ''}{data.change24h}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {((EXCHANGE_RATES[currency]?.rate || 110.25) / data.rate).toFixed(4)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
