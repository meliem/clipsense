import { ClipboardItem } from '@shared/types'
import { Code, Globe, Mail, Palette, FileText } from 'lucide-react'
import hljs from 'highlight.js'
import { useEffect, useRef } from 'react'

interface ContentPreviewProps {
  item: ClipboardItem
}

export function ContentPreview({ item }: ContentPreviewProps) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current && item.detectedTypes.some(type => type.type === 'code')) {
      hljs.highlightElement(codeRef.current)
    }
  }, [item])

  const getPreviewComponent = () => {
    const primaryType = item.detectedTypes[0]?.type

    switch (primaryType) {
      case 'url':
        return <URLPreview content={item.content} metadata={item.detectedTypes[0]?.metadata} />
      case 'email':
        return <EmailPreview content={item.content} metadata={item.detectedTypes[0]?.metadata} />
      case 'color':
        return <ColorPreview content={item.content} metadata={item.detectedTypes[0]?.metadata} />
      case 'json':
        return <JSONPreview content={item.content} />
      case 'code':
        return <CodePreview content={item.content} ref={codeRef} />
      default:
        return <TextPreview content={item.content} />
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        <FileText size={16} className="mr-2" />
        Content Preview
      </h4>
      {getPreviewComponent()}
    </div>
  )
}

function URLPreview({ content, metadata }: { content: string; metadata: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Globe size={16} className="text-blue-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">URL</span>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
        <div className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer break-all">
          {content}
        </div>
        {metadata && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>Domain: {metadata.domain}</div>
            <div>Protocol: {metadata.protocol}</div>
            {metadata.path && <div>Path: {metadata.path}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

function EmailPreview({ content, metadata }: { content: string; metadata: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Mail size={16} className="text-green-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</span>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
        <div className="text-green-600 dark:text-green-400 break-all">
          {content}
        </div>
        {metadata && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>Local: {metadata.localPart}</div>
            <div>Domain: {metadata.domain}</div>
            <div>Valid: {metadata.isValid ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function ColorPreview({ content, metadata }: { content: string; metadata: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Palette size={16} className="text-purple-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</span>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: content }}
          />
          <div className="space-y-1">
            <div className="font-mono text-sm">{content}</div>
            {metadata && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>RGB: rgb({metadata.rgb?.r}, {metadata.rgb?.g}, {metadata.rgb?.b})</div>
                <div>HEX: {metadata.hex}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function JSONPreview({ content }: { content: string }) {
  let formattedJSON = content
  try {
    const parsed = JSON.parse(content)
    formattedJSON = JSON.stringify(parsed, null, 2)
  } catch {
    // Keep original if parsing fails
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Code size={16} className="text-orange-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">JSON</span>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
        <pre className="p-3 text-sm overflow-x-auto">
          <code className="language-json">{formattedJSON}</code>
        </pre>
      </div>
    </div>
  )
}

const CodePreview = ({ content, ref }: { content: string; ref: React.RefObject<HTMLElement> }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Code size={16} className="text-blue-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code</span>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
        <pre className="p-3 text-sm overflow-x-auto">
          <code ref={ref} className="hljs">{content}</code>
        </pre>
      </div>
    </div>
  )
}

function TextPreview({ content }: { content: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <FileText size={16} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Text</span>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
        <div className="text-sm whitespace-pre-wrap break-words max-h-60 overflow-y-auto scrollbar-thin">
          {content}
        </div>
      </div>
    </div>
  )
}