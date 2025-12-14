import { useState, ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import Modal from './Modal'

interface HelpButtonProps {
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function HelpButton({ title, children, size = 'lg' }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
        aria-label={`Help: ${title}`}
        title="Click for help"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={title} size={size}>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      </Modal>
    </>
  )
}
