import { Clock, Star, Hash, Trash2, Settings } from 'lucide-react'
import { useState } from 'react'
import { useClipboardStore } from '../stores/clipboard-store'

export function Sidebar() {
  const { filteredItems, setFilters, filters } = useClipboardStore()
  const [activeView, setActiveView] = useState<'all' | 'favorites' | 'deleted'>('all')

  const allItemsCount = filteredItems.length
  const favoritesCount = filteredItems.filter(item => item.isFavorite).length
  const deletedCount = filteredItems.filter(item => item.isDeleted).length

  // Get unique content types and their counts
  const contentTypeCounts = filteredItems.reduce((acc, item) => {
    acc[item.contentType] = (acc[item.contentType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get unique detected types and their counts
  const detectedTypeCounts = filteredItems.reduce((acc, item) => {
    item.detectedTypes.forEach(type => {
      acc[type.type] = (acc[type.type] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  // Get unique tags and their counts
  const tagCounts = filteredItems.reduce((acc, item) => {
    item.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const handleViewChange = (view: 'all' | 'favorites' | 'deleted') => {
    setActiveView(view)
    if (view === 'all') {
      setFilters({ ...filters, isFavorite: undefined })
    } else if (view === 'favorites') {
      setFilters({ ...filters, isFavorite: true })
    }
  }

  const handleContentTypeFilter = (contentType: string) => {
    const currentTypes = filters.contentType || []
    const newTypes = currentTypes.includes(contentType)
      ? currentTypes.filter(type => type !== contentType)
      : [...currentTypes, contentType]
    
    setFilters({ 
      ...filters, 
      contentType: newTypes.length > 0 ? newTypes : undefined 
    })
  }

  const handleDetectedTypeFilter = (detectedType: string) => {
    const currentTypes = filters.detectedTypes || []
    const newTypes = currentTypes.includes(detectedType)
      ? currentTypes.filter(type => type !== detectedType)
      : [...currentTypes, detectedType]
    
    setFilters({ 
      ...filters, 
      detectedTypes: newTypes.length > 0 ? newTypes : undefined 
    })
  }

  const handleTagFilter = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    setFilters({ 
      ...filters, 
      tags: newTags.length > 0 ? newTags : undefined 
    })
  }

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Views */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Views</h2>
        <nav className="space-y-1">
          <button
            onClick={() => handleViewChange('all')}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
              activeView === 'all'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Clock size={16} className="mr-3" />
            All Items
            <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
              {allItemsCount}
            </span>
          </button>
          
          <button
            onClick={() => handleViewChange('favorites')}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
              activeView === 'favorites'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Star size={16} className="mr-3" />
            Favorites
            <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
              {favoritesCount}
            </span>
          </button>
        </nav>
      </div>

      {/* Content Types */}
      {Object.keys(contentTypeCounts).length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Content Types</h2>
          <div className="space-y-2">
            {Object.entries(contentTypeCounts).map(([type, count]) => (
              <button
                key={type}
                onClick={() => handleContentTypeFilter(type)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                  filters.contentType?.includes(type)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="capitalize">{type}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detected Types */}
      {Object.keys(detectedTypeCounts).length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Detected Types</h2>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
            {Object.entries(detectedTypeCounts).map(([type, count]) => (
              <button
                key={type}
                onClick={() => handleDetectedTypeFilter(type)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                  filters.detectedTypes?.includes(type)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="capitalize text-left">{type.replace('_', ' ')}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {Object.keys(tagCounts).length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tags</h2>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
            {Object.entries(tagCounts).map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => handleTagFilter(tag)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                  filters.tags?.includes(tag)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center">
                  <Hash size={12} className="mr-1" />
                  {tag}
                </span>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clear Filters */}
      {(filters.contentType?.length || filters.detectedTypes?.length || filters.tags?.length || filters.isFavorite !== undefined) && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilters({})}
            className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}