'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, ArrowRight } from 'lucide-react';

interface KPIFilterProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  onCompareChange: (compare: boolean) => void;
  onCustomRangeChange: (range: { startDate: string; endDate: string }) => void;
}


export function KPIFilter({ selectedFilter, onFilterChange, onCompareChange, onCustomRangeChange }: KPIFilterProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [compareEnabled, setCompareEnabled] = useState(false);

  const filters = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

const handleFilterChange = (filter: string) => {
  if (filter === 'custom') {
    setShowCustom(true);
    return; 
  }

  setShowCustom(false);
  onFilterChange(filter);
};


const handleCustomApply = () => {
  if (!customStart || !customEnd) return;

  onCustomRangeChange({
    startDate: customStart,
    endDate: customEnd,
  });

  onFilterChange('custom');
  setShowCustom(false);
};



  const toggleCompare = () => {
    const newCompareState = !compareEnabled;
    setCompareEnabled(newCompareState);
    onCompareChange(newCompareState);
  };

  return (
    <Card className="bg-white border-gray-200 mb-6">
      <div className="p-6">
        <div className="flex flex-col gap-6">
          {/* Filter Buttons */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Period</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

        
          {showCustom && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select Date Range
              </h4>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

         
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="compare"
              checked={compareEnabled}
              onChange={toggleCompare}
              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="compare" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              Compare with previous period
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
}