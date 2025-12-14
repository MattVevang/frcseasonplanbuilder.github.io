import { useState } from 'react'
import { ChevronDown, Plus, Pencil, Trash2, Copy } from 'lucide-react'
import { useGamePlans } from '../../hooks/useGamePlans'
import { GamePlan } from '../../types/strategy'
import Modal from '../ui/Modal'
import GamePlanForm from './GamePlanForm'
import ConfirmDialog from '../ui/ConfirmDialog'
import toast from 'react-hot-toast'

interface GamePlanSelectorProps {
  sessionCode: string
}

export default function GamePlanSelector({ sessionCode }: GamePlanSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<GamePlan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<GamePlan | null>(null)

  const {
    gamePlans,
    selectedGamePlan,
    selectGamePlan,
    addGamePlan,
    updateGamePlan,
    deleteGamePlan,
    duplicateGamePlan,
  } = useGamePlans(sessionCode)

  const handleSelectPlan = (id: string) => {
    selectGamePlan(id)
    setIsDropdownOpen(false)
  }

  const handleAddPlan = () => {
    setEditingPlan(null)
    setIsFormOpen(true)
    setIsDropdownOpen(false)
  }

  const handleEditPlan = (e: React.MouseEvent, plan: GamePlan) => {
    e.stopPropagation()
    setEditingPlan(plan)
    setIsFormOpen(true)
    setIsDropdownOpen(false)
  }

  const handleDeletePlan = (e: React.MouseEvent, plan: GamePlan) => {
    e.stopPropagation()
    setDeletingPlan(plan)
    setIsDropdownOpen(false)
  }

  const handleDuplicatePlan = async (e: React.MouseEvent, plan: GamePlan) => {
    e.stopPropagation()
    setIsDropdownOpen(false)
    const newName = `${plan.name} (Copy)`
    const result = await duplicateGamePlan(plan.id, newName)
    if (result) {
      toast.success(`Created "${newName}" with all strategies`)
      selectGamePlan(result.id)
    }
  }

  const handleFormSubmit = async (data: { name: string; description?: string }) => {
    if (editingPlan) {
      await updateGamePlan(editingPlan.id, data)
    } else {
      await addGamePlan(data)
    }
    setIsFormOpen(false)
    setEditingPlan(null)
  }

  const handleConfirmDelete = async () => {
    if (deletingPlan) {
      await deleteGamePlan(deletingPlan.id)
    }
    setDeletingPlan(null)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[200px]"
          >
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {selectedGamePlan?.name || 'Select Plan'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {gamePlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        plan.id === selectedGamePlan?.id
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {plan.name}
                        </div>
                        {plan.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {plan.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => handleDuplicatePlan(e, plan)}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                          title="Duplicate plan"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleEditPlan(e, plan)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Edit plan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {gamePlans.length > 1 && (
                          <button
                            onClick={(e) => handleDeletePlan(e, plan)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="Delete plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleAddPlan}
                    className="flex items-center gap-2 w-full px-3 py-2 text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Plan</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleAddPlan}
          className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          title="Add new game plan"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingPlan(null)
        }}
        title={editingPlan ? 'Edit Game Plan' : 'New Game Plan'}
      >
        <GamePlanForm
          gamePlan={editingPlan}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingPlan(null)
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Game Plan?"
        message={`Are you sure you want to delete "${deletingPlan?.name}"? This will also delete all strategies in this plan.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
