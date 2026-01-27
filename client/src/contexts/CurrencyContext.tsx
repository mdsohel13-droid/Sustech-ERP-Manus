import { createContext, useContext, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface CurrencyContextType {
  currency: string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "BDT",
  isLoading: true,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { data: settings, isLoading } = trpc.settings.getAll.useQuery();
  
  // Find the default currency setting
  const currencySetting = settings?.find(s => s.settingKey === "defaultCurrency");
  const currency = currencySetting?.settingValue || "BDT";

  return (
    <CurrencyContext.Provider value={{ currency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
