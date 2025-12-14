import { QRCodeSVG } from 'qrcode.react'
import Modal from './Modal'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  sessionCode: string
}

export default function QRCodeModal({ isOpen, onClose, sessionCode }: QRCodeModalProps) {
  const sessionUrl = `${window.location.origin}/session/${sessionCode}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Session" size="sm">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-lg">
          <QRCodeSVG
            value={sessionUrl}
            size={200}
            level="M"
            includeMargin={false}
          />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scan to join session
          </p>
          <p className="font-mono text-lg font-semibold text-primary-600 dark:text-primary-400">
            {sessionCode}
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
          Share this QR code or session ID with your teammates
        </p>
      </div>
    </Modal>
  )
}
