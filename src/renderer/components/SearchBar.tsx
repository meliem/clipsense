import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { useClipboardStore } from '../stores/clipboard-store'
import { SearchFilters } from '@shared/types'

export function SearchBar() {
  const { searchQuery, setSearchQuery, searchItems, setFilters, filters } = useClipboardStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery)
        if (localQuery.trim()) {
          searchItems(localQuery, filters)
        }
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [localQuery, searchQuery, setSearchQuery, searchItems, filters])

  const handleClearSearch = () => {
    setLocalQuery('')
    setSearchQuery('')
  }

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    if (localQuery.trim()) {
      searchItems(localQuery, updatedFilters)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search clipboard history..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="w-full pl-10 pr-20 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        
        <div className="absolute right-2 flex items-center space-x-1">
          {localQuery && (
            <button
              onClick={handleClearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded transition-colors ${
              showFilters 
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            }`}
            title="Filters"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Content Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Type
              </label>
              <select
                multiple
                value={filters.contentType || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  handleFilterChange({ contentType: values.length ? values : undefined })
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900 dark:text-white"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="files">Files</option>
              </select>
            </div>

            {/* Favorite Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Favorites
              </label>
              <select
                value={filters.isFavorite === undefined ? '' : filters.isFavorite.toString()}
                onChange={(e) => {
                  const value = e.target.value
                  handleFilterChange({ 
                    isFavorite: value === '' ? undefined : value === 'true' 
                  })
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900 dark:text-white"
              >
                <option value="">All items</option>
                <option value="true">Favorites only</option>
                <option value="false">Non-favorites only</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                onChange={(e) => {
                  const value = e.target.value
                  let dateRange: { start: Date; end: Date } | undefined
                  
                  if (value === 'today') {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const tomorrow = new Date(today)
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    dateRange = { start: today, end: tomorrow }
                  } else if (value === 'week') {
                    const now = new Date()
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    dateRange = { start: weekAgo, end: now }
                  } else if (value === 'month') {
                    const now = new Date()
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    dateRange = { start: monthAgo, end: now }
                  }
                  
                  handleFilterChange({ dateRange })
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900 dark:text-white"
              >
                <option value="">All time</option>
                <option value="today">Today</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilters({})
                setShowFilters(false)
              }}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}