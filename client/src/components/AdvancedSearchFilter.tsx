import React, { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Save, RotateCcw, ChevronDown } from "lucide-react";

interface FilterCondition {
  id: string;
  field: string;
  operator: "equals" | "contains" | "gt" | "lt" | "between" | "startsWith" | "endsWith";
  value: string | number | [number, number];
  type: "text" | "number" | "date" | "select";
}

interface SavedFilter {
  id: string;
  name: string;
  conditions: FilterCondition[];
  createdAt: Date;
}

interface AdvancedSearchFilterProps {
  fields: Array<{ name: string; label: string; type: "text" | "number" | "date" | "select"; options?: string[] }>;
  onSearch: (conditions: FilterCondition[]) => void;
  onFilter: (filters: FilterCondition[]) => void;
  placeholder?: string;
}

/**
 * Advanced Search and Filtering Component
 * Provides comprehensive search and filtering capabilities for ERP modules
 */
export const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  fields,
  onSearch,
  onFilter,
  placeholder = "Search across all fields...",
}) => {
  const [globalSearch, setGlobalSearch] = useState("");
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [filterName, setFilterName] = useState("");

  const handleGlobalSearch = useCallback(
    (value: string) => {
      setGlobalSearch(value);
      onSearch([
        {
          id: "global",
          field: "all",
          operator: "contains",
          value,
          type: "text",
        },
      ]);
    },
    [onSearch]
  );

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: `condition-${Date.now()}`,
      field: fields[0]?.name || "",
      operator: "equals",
      value: "",
      type: fields[0]?.type || "text",
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    const updated = conditions.filter((c) => c.id !== id);
    setConditions(updated);
    onFilter(updated);
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    const updated = conditions.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setConditions(updated);
    onFilter(updated);
  };

  const saveFilter = () => {
    if (!filterName.trim()) return;
    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name: filterName,
      conditions: [...conditions],
      createdAt: new Date(),
    };
    setSavedFilters([...savedFilters, newFilter]);
    setFilterName("");
  };

  const loadFilter = (filter: SavedFilter) => {
    setConditions([...filter.conditions]);
    onFilter(filter.conditions);
  };

  const deleteFilter = (id: string) => {
    setSavedFilters(savedFilters.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setConditions([]);
    setGlobalSearch("");
    onFilter([]);
    onSearch([]);
  };

  const activeFilterCount = conditions.length + (globalSearch ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Global Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={globalSearch}
          onChange={(e) => handleGlobalSearch(e.target.value)}
          className="pl-10"
        />
        {globalSearch && (
          <button
            onClick={() => handleGlobalSearch("")}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          Advanced Filters {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount}</Badge>}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <Card className="p-4 space-y-4">
          {/* Filter Conditions */}
          <div className="space-y-3">
            {conditions.map((condition) => (
              <div key={condition.id} className="flex items-end gap-2 p-3 bg-gray-50 rounded">
                <select
                  value={condition.field}
                  onChange={(e) => {
                    const field = fields.find((f) => f.name === e.target.value);
                    updateCondition(condition.id, {
                      field: e.target.value,
                      type: field?.type || "text",
                    });
                  }}
                  className="px-3 py-2 border rounded text-sm flex-1"
                >
                  {fields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <select
                  value={condition.operator}
                  onChange={(e) =>
                    updateCondition(condition.id, {
                      operator: e.target.value as FilterCondition["operator"],
                    })
                  }
                  className="px-3 py-2 border rounded text-sm"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="startsWith">Starts With</option>
                  <option value="endsWith">Ends With</option>
                  <option value="gt">Greater Than</option>
                  <option value="lt">Less Than</option>
                  <option value="between">Between</option>
                </select>

                {condition.type === "select" ? (
                  <select
                    value={String(condition.value)}
                    onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                    className="px-3 py-2 border rounded text-sm flex-1"
                  >
                    <option value="">Select...</option>
                    {fields
                      .find((f) => f.name === condition.field)
                      ?.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                  </select>
                ) : (
                  <Input
                    type={condition.type === "date" ? "date" : "text"}
                    value={String(condition.value)}
                    onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                    placeholder="Value"
                    className="flex-1"
                  />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(condition.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Condition Button */}
          <Button variant="outline" size="sm" onClick={addCondition} className="w-full">
            + Add Condition
          </Button>

          {/* Save Filter */}
          <div className="flex gap-2">
            <Input
              placeholder="Save filter as..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="text-sm"
            />
            <Button size="sm" onClick={saveFilter} disabled={!filterName.trim()} className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Saved Filters</p>
              <div className="space-y-2">
                {savedFilters.map((filter) => (
                  <div key={filter.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <button
                      onClick={() => loadFilter(filter)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex-1 text-left"
                    >
                      {filter.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFilter(filter.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {globalSearch && (
            <Badge variant="secondary" className="gap-2">
              Search: {globalSearch}
              <button onClick={() => handleGlobalSearch("")} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {conditions.map((condition) => (
            <Badge key={condition.id} variant="secondary" className="gap-2">
              {condition.field} {condition.operator} {String(condition.value)}
              <button onClick={() => removeCondition(condition.id)} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Global Search Component - Minimal version for quick access
 */
export const GlobalSearch: React.FC<{
  onSearch: (query: string) => void;
  placeholder?: string;
}> = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        className="pl-10 pr-10"
      />
      {query && (
        <button
          onClick={() => {
            setQuery("");
            onSearch("");
          }}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * Filter Manager - For managing multiple saved filters
 */
export const FilterManager: React.FC<{
  filters: SavedFilter[];
  onLoad: (filter: SavedFilter) => void;
  onDelete: (id: string) => void;
}> = ({ filters, onLoad, onDelete }) => {
  return (
    <div className="space-y-2">
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex-1">
            <p className="font-medium text-sm">{filter.name}</p>
            <p className="text-xs text-gray-600">{filter.conditions.length} conditions</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onLoad(filter)}>
              Load
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(filter.id)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdvancedSearchFilter;
