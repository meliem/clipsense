import { useClipboardStore } from '../stores/clipboard-store'
import { ClipboardItemComponent } from './ClipboardItem'

export function ClipboardList() {
  const { filteredItems, selectedItem, selectItem } = useClipboardStore()

  if (filteredItems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No clipboard items found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Start copying content to see it appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-thin p-4 space-y-2">
        {filteredItems.map((item) => (
          <ClipboardItemComponent
            key={item.id}
            item={item}
            isSelected={selectedItem?.id === item.id}
            onSelect={() => selectItem(item)}
          />
        ))}
      </div>
    </div>
  )
}