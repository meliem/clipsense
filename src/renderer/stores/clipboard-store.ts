import { create } from 'zustand'
import { ClipboardItem, SearchFilters } from '@shared/types'
import toast from 'react-hot-toast'

interface ClipboardStore {
  items: ClipboardItem[]
  filteredItems: ClipboardItem[]
  selectedItem: ClipboardItem | null
  searchQuery: string
  filters: SearchFilters
  isLoading: boolean
  
  // Actions
  fetchHistory: () => Promise<void>
  searchItems: (query: string, filters?: SearchFilters) => Promise<void>
  selectItem: (item: ClipboardItem | null) => void
  deleteItem: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  addTags: (id: string, tags: string[]) => Promise<void>
  removeTags: (id: string, tags: string[]) => Promise<void>
  copyToClipboard: (content: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  applyFilters: () => void
}

export const useClipboardStore = create<ClipboardStore>((set, get) => ({
  items: [],
  filteredItems: [],
  selectedItem: null,
  searchQuery: '',
  filters: {},
  isLoading: false,

  fetchHistory: async () => {
    set({ isLoading: true })
    try {
      const items = await window.electronAPI.clipboard.getHistory()
      set({ items, filteredItems: items, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch clipboard history:', error)
      toast.error('Failed to load clipboard history')
      set({ isLoading: false })
    }
  },

  searchItems: async (query: string, filters?: SearchFilters) => {
    set({ isLoading: true, searchQuery: query })
    try {
      const items = await window.electronAPI.clipboard.search(query, filters)
      set({ filteredItems: items, isLoading: false })
    } catch (error) {
      console.error('Failed to search clipboard items:', error)
      toast.error('Search failed')
      set({ isLoading: false })
    }
  },

  selectItem: (item: ClipboardItem | null) => {
    set({ selectedItem: item })
  },

  deleteItem: async (id: string) => {
    try {
      await window.electronAPI.clipboard.deleteItem(id)
      const { items, filteredItems } = get()
      const newItems = items.filter(item => item.id !== id)
      const newFilteredItems = filteredItems.filter(item => item.id !== id)
      set({ 
        items: newItems, 
        filteredItems: newFilteredItems,
        selectedItem: get().selectedItem?.id === id ? null : get().selectedItem
      })
      toast.success('Item deleted')
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('Failed to delete item')
    }
  },

  toggleFavorite: async (id: string) => {
    try {
      await window.electronAPI.clipboard.toggleFavorite(id)
      const { items, filteredItems } = get()
      
      const updateItem = (item: ClipboardItem) => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      
      set({
        items: items.map(updateItem),
        filteredItems: filteredItems.map(updateItem)
      })
      
      const item = items.find(item => item.id === id)
      if (item) {
        toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorites')
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      toast.error('Failed to update favorite status')
    }
  },

  addTags: async (id: string, tags: string[]) => {
    try {
      await window.electronAPI.clipboard.addTags(id, tags)
      const { items, filteredItems } = get()
      
      const updateItem = (item: ClipboardItem) => 
        item.id === id 
          ? { ...item, tags: [...new Set([...item.tags, ...tags])] }
          : item
      
      set({
        items: items.map(updateItem),
        filteredItems: filteredItems.map(updateItem)
      })
      
      toast.success('Tags added')
    } catch (error) {
      console.error('Failed to add tags:', error)
      toast.error('Failed to add tags')
    }
  },

  removeTags: async (id: string, tags: string[]) => {
    try {
      await window.electronAPI.clipboard.removeTags(id, tags)
      const { items, filteredItems } = get()
      
      const updateItem = (item: ClipboardItem) => 
        item.id === id 
          ? { ...item, tags: item.tags.filter(tag => !tags.includes(tag)) }
          : item
      
      set({
        items: items.map(updateItem),
        filteredItems: filteredItems.map(updateItem)
      })
      
      toast.success('Tags removed')
    } catch (error) {
      console.error('Failed to remove tags:', error)
      toast.error('Failed to remove tags')
    }
  },

  copyToClipboard: async (content: string) => {
    try {
      await window.electronAPI.clipboard.copyToClipboard(content)
      toast.success('Copied to clipboard')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy to clipboard')
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
    get().applyFilters()
  },

  setFilters: (filters: SearchFilters) => {
    set({ filters })
    get().applyFilters()
  },

  applyFilters: () => {
    const { items, searchQuery, filters } = get()
    let filtered = [...items]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply content type filter
    if (filters.contentType?.length) {
      filtered = filtered.filter(item => 
        filters.contentType!.includes(item.contentType)
      )
    }

    // Apply detected types filter
    if (filters.detectedTypes?.length) {
      filtered = filtered.filter(item => 
        item.detectedTypes.some(type => 
          filters.detectedTypes!.includes(type.type)
        )
      )
    }

    // Apply favorite filter
    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(item => item.isFavorite === filters.isFavorite)
    }

    // Apply date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt)
        return itemDate >= start && itemDate <= end
      })
    }

    // Apply tags filter
    if (filters.tags?.length) {
      filtered = filtered.filter(item => 
        filters.tags!.some(tag => item.tags.includes(tag))
      )
    }

    set({ filteredItems: filtered })
  }
}))