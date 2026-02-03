import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, User, BarChart3 } from 'lucide-react';

const AdvancedFilter = ({ 
  data, 
  onFilter, 
  searchableFields = [],
  filterOptions = {},
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Apply filters and search
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item => {
        return searchableFields.some(field => {
          const value = getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        if (key.includes('date')) {
          filtered = filtered.filter(item => {
            const itemDate = new Date(getNestedValue(item, key));
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            const endDate = dateRange.end ? new Date(dateRange.end) : null;
            
            if (startDate && endDate) {
              return itemDate >= startDate && itemDate <= endDate;
            } else if (startDate) {
              return itemDate >= startDate;
            } else if (endDate) {
              return itemDate <= endDate;
            }
            return true;
          });
        } else if (key.includes('score')) {
          const [min, max] = value.split('-').map(Number);
          filtered = filtered.filter(item => {
            const score = getNestedValue(item, key);
            return score >= min && score <= max;
          });
        } else {
          filtered = filtered.filter(item => {
            const itemValue = getNestedValue(item, key);
            return itemValue === value || (Array.isArray(value) && value.includes(itemValue));
          });
        }
      }
    });

    return filtered;
  }, [data, searchTerm, activeFilters, dateRange, searchableFields]);

  // Notify parent of filtered data
  useEffect(() => {
    onFilter(filteredData);
  }, [filteredData, onFilter]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilter = (key) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => activeFilters[key] && activeFilters[key] !== 'all').length + 
           (searchTerm ? 1 : 0);
  };

  const renderFilterOption = (key, option) => {
    const { type, label, options, placeholder } = option;
    const currentValue = activeFilters[key] || '';

    switch (type) {
      case 'select':
        return (
          <select
            value={currentValue}
            onChange={(e) => handleFilterChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{placeholder || `All ${label}`}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {options.map(opt => (
              <label key={opt.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={currentValue.includes(opt.value)}
                  onChange={(e) => {
                    const values = currentValue ? currentValue.split(',') : [];
                    if (e.target.checked) {
                      values.push(opt.value);
                    } else {
                      const index = values.indexOf(opt.value);
                      if (index > -1) values.splice(index, 1);
                    }
                    handleFilterChange(key, values.join(','));
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Start date"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="End date"
            />
          </div>
        );

      case 'range':
        return (
          <select
            value={currentValue}
            onChange={(e) => handleFilterChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">{placeholder || `All ${label}`}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            getActiveFilterCount() > 0
              ? 'border-purple-500 bg-purple-50 text-purple-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1">
              {getActiveFilterCount()}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Clear All */}
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <div className="inline-flex items-center space-x-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
              <Search className="w-3 h-3" />
              <span>Search: "{searchTerm}"</span>
              <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === 'all') return null;
            const option = filterOptions[key];
            const label = option?.label || key;
            
            return (
              <div key={key} className="inline-flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                <span>{label}: {value}</span>
                <button onClick={() => clearFilter(key)} className="ml-1 hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 animate-fadeInUp">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(filterOptions).map(([key, option]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {option.label}
                </label>
                {renderFilterOption(key, option)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredData.length} of {data.length} results
        </span>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilter;
