import { QRCodeSVG } from 'qrcode.react'
import Modal from './Modal'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  sessionCode: string
  pin?: string | null
}

export default function QRCodeModal({ isOpen, onClose, sessionCode, pin }: QRCodeModalProps) {
  // Include PIN in URL if available - allows teammates to join directly
  const sessionUrl = pin
    ? `${window.location.origin}/session/${sessionCode}?pin=${pin}`
    : `${window.location.origin}/session/${sessionCode}`

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
          {pin && (
            <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
              PIN: {pin}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
          {pin
            ? 'QR code includes PIN - teammates will join directly'
            : 'Share this QR code or session ID with your teammates'
          }
        </p>
      </div>
    </Modal>
  )
}
