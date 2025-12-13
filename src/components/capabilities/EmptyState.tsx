import { Package } from 'lucide-react'
import Button from '../ui/Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="card p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  )
}
