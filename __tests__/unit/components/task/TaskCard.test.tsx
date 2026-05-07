import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '@/components/task/TaskCard'
import { createMockTask } from '@/__tests__/helpers/test-utils'

describe('TaskCard Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  describe('Rendering Task Information', () => {
    it('should render todo task with title and type', () => {
      const task = createMockTask({
        type: 'todo',
        title: 'Test Todo Task',
        difficulty: 'medium',
      })

      render(<TaskCard task={task} />)

      expect(screen.getByText('Test Todo Task')).toBeInTheDocument()
    })

    it('should render habit task with correct type', () => {
      const task = createMockTask({
        type: 'habit',
        title: 'Exercise',
        difficulty: 'hard',
      })

      render(<TaskCard task={task} />)

      expect(screen.getByText('Exercise')).toBeInTheDocument()
    })

    it('should render daily task with correct type', () => {
      const task = createMockTask({
        type: 'daily',
        title: 'Daily Meditation',
        difficulty: 'easy',
      })

      render(<TaskCard task={task} />)

      expect(screen.getByText('Daily Meditation')).toBeInTheDocument()
    })

    it('should render task description when provided', () => {
      const task = createMockTask({
        title: 'Task with description',
        description: 'This is a detailed description',
      })

      render(<TaskCard task={task} />)

      expect(screen.getByText('This is a detailed description')).toBeInTheDocument()
    })

    it('should render task tags', () => {
      const task = createMockTask({
        title: 'Tagged Task',
        tags: ['fitness', 'health'],
      })

      render(<TaskCard task={task} />)

      expect(screen.getByText('#fitness')).toBeInTheDocument()
      expect(screen.getByText('#health')).toBeInTheDocument()
    })

    it('should render difficulty badges correctly', () => {
      const easyTask = createMockTask({ difficulty: 'easy' })
      const hardTask = createMockTask({ difficulty: 'hard' })

      render(<TaskCard task={easyTask} />)
      render(<TaskCard task={hardTask} />)

      expect(screen.getByText('Easy')).toBeInTheDocument()
      expect(screen.getByText('Hard')).toBeInTheDocument()
    })

    it('should render very_easy and very_hard difficulty', () => {
      const veryEasyTask = createMockTask({ difficulty: 'very_easy' })
      const veryHardTask = createMockTask({ difficulty: 'very_hard' })

      render(<TaskCard task={veryEasyTask} />)
      render(<TaskCard task={veryHardTask} />)

      expect(screen.getByText('Very Easy')).toBeInTheDocument()
      expect(screen.getByText('Very Hard')).toBeInTheDocument()
    })
  })

  describe('Task Type Specific Features', () => {
    it('should show habit action buttons for habit tasks', () => {
      const task = createMockTask({ type: 'habit' })
      const onHabitAction = vi.fn()

      render(<TaskCard task={task} onHabitAction={onHabitAction} />)

      expect(screen.getByText(/positive/i)).toBeInTheDocument()
      expect(screen.getByText(/negative/i)).toBeInTheDocument()
    })

    it('should show complete button for daily tasks', () => {
      const task = createMockTask({ type: 'daily' })
      const onComplete = vi.fn()

      render(<TaskCard task={task} onComplete={onComplete} />)

      expect(screen.getByText(/complete daily/i)).toBeInTheDocument()
    })

    it('should show complete button for todo tasks', () => {
      const task = createMockTask({ type: 'todo' })
      const onComplete = vi.fn()

      render(<TaskCard task={task} onComplete={onComplete} />)

      expect(screen.getByText(/complete to-do/i)).toBeInTheDocument()
    })

    it('should show streak badge for daily tasks with streak', () => {
      const task = createMockTask({
        type: 'daily',
        streak: 7,
      })

      render(<TaskCard task={task} />)

      expect(screen.getByText('🔥 7')).toBeInTheDocument()
    })

    it('should not show streak badge for daily tasks with zero streak', () => {
      const task = createMockTask({
        type: 'daily',
        streak: 0,
      })

      render(<TaskCard task={task} />)

      expect(screen.queryByText(/🔥/)).not.toBeInTheDocument()
    })

    it('should not show streak badge for non-daily tasks', () => {
      const todoTask = createMockTask({ type: 'todo' })
      const habitTask = createMockTask({ type: 'habit' })

      render(<TaskCard task={todoTask} />)
      expect(screen.queryByText(/🔥/)).not.toBeInTheDocument()

      render(<TaskCard task={habitTask} />)
      expect(screen.queryByText(/🔥/)).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onComplete when complete button clicked for todo', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ type: 'todo' })
      const onComplete = vi.fn()

      render(<TaskCard task={task} onComplete={onComplete} />)

      const completeButton = screen.getByText(/complete to-do/i)
      await user.click(completeButton)

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('should call onComplete when complete button clicked for daily', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ type: 'daily' })
      const onComplete = vi.fn()

      render(<TaskCard task={task} onComplete={onComplete} />)

      const completeButton = screen.getByText(/complete daily/i)
      await user.click(completeButton)

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('should call onHabitAction with positive when positive button clicked', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ type: 'habit' })
      const onHabitAction = vi.fn()

      render(<TaskCard task={task} onHabitAction={onHabitAction} />)

      const positiveButton = screen.getByText(/positive/i)
      await user.click(positiveButton)

      expect(onHabitAction).toHaveBeenCalledWith('positive')
    })

    it('should call onHabitAction with negative when negative button clicked', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ type: 'habit' })
      const onHabitAction = vi.fn()

      render(<TaskCard task={task} onHabitAction={onHabitAction} />)

      const negativeButton = screen.getByText(/negative/i)
      await user.click(negativeButton)

      expect(onHabitAction).toHaveBeenCalledWith('negative')
    })

    it('should call edit and delete handlers when clicked', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ type: 'todo' })
      const onEdit = vi.fn()
      const onDelete = vi.fn()

      render(<TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      // Test first button
      await user.click(buttons[0])
      expect(onEdit).toHaveBeenCalledTimes(1)

      // Test second button if exists
      if (buttons.length > 1) {
        await user.click(buttons[1])
        expect(onDelete).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Completed States', () => {
    it('should disable complete button for completed todo', () => {
      const task = createMockTask({
        type: 'todo',
        completed: true,
      })
      const onComplete = vi.fn()

      render(<TaskCard task={task} onComplete={onComplete} />)

      const completeButton = screen.getByText(/completed/i).closest('button')
      expect(completeButton).toBeDisabled()
    })

    it('should disable complete button for completed daily', () => {
      const task = createMockTask({
        type: 'daily',
        completedToday: true,
      })
      const onComplete = vi.fn()

      render(<TaskCard task={task} onComplete={onComplete} />)

      const completeButton = screen.getByText(/completed/i).closest('button')
      expect(completeButton).toBeDisabled()
    })

    it('should show completed text for completed todo', () => {
      const task = createMockTask({
        type: 'todo',
        completed: true,
      })

      render(<TaskCard task={task} onComplete={vi.fn()} />)

      expect(screen.getByText(/completed/i)).toBeInTheDocument()
    })

    it('should show completed today text for completed daily', () => {
      const task = createMockTask({
        type: 'daily',
        completedToday: true,
      })

      render(<TaskCard task={task} onComplete={vi.fn()} />)

      expect(screen.getByText(/completed today/i)).toBeInTheDocument()
    })
  })

  describe('Conditional Rendering', () => {
    it('should not render action buttons when handlers not provided', () => {
      const task = createMockTask({ type: 'todo' })

      render(<TaskCard task={task} />)

      expect(screen.queryByText(/complete/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/positive/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/negative/i)).not.toBeInTheDocument()
    })

    it('should not render edit/delete buttons when handlers not provided', () => {
      const task = createMockTask({ type: 'todo' })

      render(<TaskCard task={task} />)

      // Should only have complete button if provided
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBe(0)
    })

    it('should not render description when not provided', () => {
      const task = createMockTask({
        title: 'Simple task title',
      })

      const { container } = render(<TaskCard task={task} />)

      expect(screen.getByText('Simple task title')).toBeInTheDocument()
      // Check that there's no description paragraph
      const paragraphs = container.querySelectorAll('p')
      expect(paragraphs.length).toBe(0)
    })

    it('should not render tags when empty array', () => {
      const task = createMockTask({
        title: 'Task without tags',
        tags: [],
      })

      render(<TaskCard task={task} />)

      expect(screen.queryByText(/#/)).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle task with very long title', () => {
      const longTitle = 'This is a very long task title that should wrap properly and not break the layout'
      const task = createMockTask({ title: longTitle })

      render(<TaskCard task={task} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle task with very long description', () => {
      const longDescription = 'This is a very long description that should be truncated with line-clamp'
      const task = createMockTask({
        title: 'Task',
        description: longDescription,
      })

      render(<TaskCard task={task} />)

      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should handle task with many tags', () => {
      const manyTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
      const task = createMockTask({
        title: 'Tagged Task',
        tags: manyTags,
      })

      render(<TaskCard task={task} />)

      manyTags.forEach(tag => {
        expect(screen.getByText(`#${tag}`)).toBeInTheDocument()
      })
    })

    it('should handle task with special characters in title', () => {
      const specialTitle = 'Task with special chars & symbols'
      const task = createMockTask({ title: specialTitle })

      render(<TaskCard task={task} />)

      expect(screen.getByText(specialTitle)).toBeInTheDocument()
    })

    it('should handle task with undefined streak', () => {
      const task = createMockTask({
        type: 'daily',
        streak: undefined,
      })

      render(<TaskCard task={task} />)

      expect(screen.queryByText(/🔥/)).not.toBeInTheDocument()
    })
  })
})