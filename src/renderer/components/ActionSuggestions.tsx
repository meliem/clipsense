import { ClipboardItem } from '@shared/types'
import { ExternalLink, Copy, Link, Mail, Palette, Code, Map } from 'lucide-react'
import { useClipboardStore } from '../stores/clipboard-store'
import toast from 'react-hot-toast'

interface ActionSuggestionsProps {
  item: ClipboardItem
}

export function ActionSuggestions({ item }: ActionSuggestionsProps) {
  const { copyToClipboard } = useClipboardStore()

  const handleAction = async (action: string, params: any) => {
    try {
      switch (action) {
        case 'openUrl':
          window.open(params.url, '_blank')
          break
        case 'copyText':
          await copyToClipboard(params.text)
          break
        case 'composeEmail':
          window.open(`mailto:${params.email}`, '_blank')
          break
        case 'formatJson':
          try {
            const formatted = JSON.stringify(JSON.parse(item.content), null, 2)
            await copyToClipboard(formatted)
            toast.success('Formatted JSON copied to clipboard')
          } catch {
            toast.error('Invalid JSON format')
          }
          break
        case 'minifyJson':
          try {
            const minified = JSON.stringify(JSON.parse(item.content))
            await copyToClipboard(minified)
            toast.success('Minified JSON copied to clipboard')
          } catch {
            toast.error('Invalid JSON format')
          }
          break
        case 'shortenUrl':
          // This would integrate with a URL shortening service
          toast.info('URL shortening integration coming soon')
          break
        case 'generatePalette':
          // This would generate a color palette
          toast.info('Color palette generation coming soon')
          break
        default:
          console.log('Unknown action:', action, params)
      }
    } catch (error) {
      console.error('Action failed:', error)
      toast.error('Action failed')
    }
  }

  const getSuggestions = () => {
    const suggestions: Array<{
      id: string
      label: string
      action: string
      params: any
      icon: React.ReactNode
      variant: 'primary' | 'secondary'
    }> = []

    item.detectedTypes.forEach(type => {
      switch (type.type) {
        case 'url':
          suggestions.push(
            {
              id: 'open-url',
              label: 'Open URL',
              action: 'openUrl',
              params: { url: item.content },
              icon: <ExternalLink size={16} />,
              variant: 'primary'
            },
            {
              id: 'copy-domain',
              label: 'Copy Domain',
              action: 'copyText',
              params: { text: type.metadata?.domain || '' },
              icon: <Copy size={16} />,
              variant: 'secondary'
            },
            {
              id: 'shorten-url',
              label: 'Shorten URL',
              action: 'shortenUrl',
              params: { url: item.content },
              icon: <Link size={16} />,
              variant: 'secondary'
            }
          )
          break

        case 'email':
          suggestions.push(
            {
              id: 'compose-email',
              label: 'Compose Email',
              action: 'composeEmail',
              params: { email: item.content },
              icon: <Mail size={16} />,
              variant: 'primary'
            },
            {
              id: 'copy-domain',
              label: 'Copy Domain',
              action: 'copyText',
              params: { text: type.metadata?.domain || '' },
              icon: <Copy size={16} />,
              variant: 'secondary'
            }
          )
          break

        case 'color':
          suggestions.push(
            {
              id: 'copy-rgb',
              label: 'Copy as RGB',
              action: 'copyText',
              params: { 
                text: type.metadata?.rgb 
                  ? `rgb(${type.metadata.rgb.r}, ${type.metadata.rgb.g}, ${type.metadata.rgb.b})`
                  : item.content
              },
              icon: <Copy size={16} />,
              variant: 'secondary'
            },
            {
              id: 'copy-hex',
              label: 'Copy as HEX',
              action: 'copyText',
              params: { text: type.metadata?.hex || item.content },
              icon: <Copy size={16} />,
              variant: 'secondary'
            },
            {
              id: 'generate-palette',
              label: 'Generate Palette',
              action: 'generatePalette',
              params: { color: item.content },
              icon: <Palette size={16} />,
              variant: 'primary'
            }
          )
          break

        case 'json':
          suggestions.push(
            {
              id: 'format-json',
              label: 'Format JSON',
              action: 'formatJson',
              params: {},
              icon: <Code size={16} />,
              variant: 'primary'
            },
            {
              id: 'minify-json',
              label: 'Minify JSON',
              action: 'minifyJson',
              params: {},
              icon: <Code size={16} />,
              variant: 'secondary'
            }
          )
          break

        case 'phone':
          suggestions.push(
            {
              id: 'call-phone',
              label: 'Call Number',
              action: 'callPhone',
              params: { phone: item.content },
              icon: <ExternalLink size={16} />,
              variant: 'primary'
            }
          )
          break

        case 'coordinates':
          suggestions.push(
            {
              id: 'open-maps',
              label: 'Open in Maps',
              action: 'openMaps',
              params: { coordinates: item.content },
              icon: <Map size={16} />,
              variant: 'primary'
            }
          )
          break
      }
    })

    // Remove duplicates based on action and params
    const uniqueSuggestions = suggestions.filter((suggestion, index, arr) => 
      arr.findIndex(s => s.action === suggestion.action && 
        JSON.stringify(s.params) === JSON.stringify(suggestion.params)) === index
    )

    return uniqueSuggestions.slice(0, 6) // Limit to 6 suggestions
  }

  const suggestions = getSuggestions()

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Suggested Actions
      </h5>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleAction(suggestion.action, suggestion.params)}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              suggestion.variant === 'primary'
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {suggestion.icon}
            <span className="ml-2">{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}