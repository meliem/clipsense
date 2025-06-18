import { useState } from 'react'
import { 
  Star, 
  Copy, 
  Trash2, 
  MoreHorizontal, 
  Tag,
  ExternalLink,
  Hash,
  Eye,
  EyeOff
} from 'lucide-react'
import { format } from 'date-fns'
import { ClipboardItem } from '@shared/types'
import { useClipboardStore } from '../stores/clipboard-store'
import { ContentPreview } from './ContentPreview'
import { ActionSuggestions } from './ActionSuggestions'

interface ClipboardItemProps {
  item: ClipboardItem
  isSelected: boolean
  onSelect: () => void
}

export function ClipboardItemComponent({ item, isSelected, onSelect }: ClipboardItemProps) {
  const { copyToClipboard, deleteItem, toggleFavorite, addTags, removeTags } = useClipboardStore()
  const [showMenu, setShowMenu] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await copyToClipboard(item.content)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteItem(item.id)
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleFavorite(item.id)
  }

  const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.stopPropagation()
      await addTags(item.id, [newTag.trim()])
      setNewTag('')
      setShowTags(false)
    }
  }

  const handleRemoveTag = async (tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await removeTags(item.id, [tag])
  }

  const getContentPreview = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const formatTimestamp = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a')
  }

  return (
    <div
      className={`relative group bg-white dark:bg-gray-800 border rounded-lg transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-primary-500 shadow-lg ring-2 ring-primary-500 ring-opacity-20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex-1 min-w-0">
          {/* Content Type & Detected Types */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {item.contentType}
            </span>
            {item.detectedTypes.slice(0, 3).map((type) => (
              <span
                key={type.type}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {type.type.replace('_', ' ')}
              </span>
            ))}
            {item.detectedTypes.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{item.detectedTypes.length - 3} more
              </span>
            )}
          </div>

          {/* Content Preview */}
          <div className="text-gray-900 dark:text-white mb-2">
            {item.metadata.isSensitive ? (
              <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <EyeOff size={16} />
                <span className="text-sm">Sensitive content (masked)</span>
              </div>
            ) : (
              <div className={`${isExpanded ? '' : 'line-clamp-3'} whitespace-pre-wrap break-words`}>
                {isExpanded ? item.content : getContentPreview(item.content, 200)}
              </div>
            )}
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 group"
                >
                  <Hash size={10} className="mr-1" />
                  {tag}
                  <button
                    onClick={(e) => handleRemoveTag(tag, e)}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-600 dark:hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimestamp(item.createdAt)}
            {item.metadata.originalLength && item.metadata.isTruncated && (
              <span className="ml-2">
                (Truncated from {item.metadata.originalLength} characters)
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded transition-colors ${
              item.isFavorite
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={16} fill={item.isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded transition-colors"
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded transition-colors"
              title="More actions"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  {isExpanded ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowTags(!showTags)
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Tag size={16} className="mr-2" />
                  Add Tag
                </button>
                
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isSelected && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Content Preview */}
          <div className="p-4">
            <ContentPreview item={item} />
          </div>

          {/* Action Suggestions */}
          {item.detectedTypes.length > 0 && (
            <div className="px-4 pb-4">
              <ActionSuggestions item={item} />
            </div>
          )}
        </div>
      )}

      {/* Tag Input */}
      {showTags && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <input
            type="text"
            placeholder="Add a tag and press Enter"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            onBlur={() => setShowTags(false)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            autoFocus
          />
        </div>
      )}

      {/* Click outside handler for menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}