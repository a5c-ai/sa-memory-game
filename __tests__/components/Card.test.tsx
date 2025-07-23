import { render, screen } from '../utils/test-utils'
import { setupUser } from '../utils/test-utils'
import Card from '../../app/components/Card'
import { createMockCard } from '../utils/test-utils'

describe('Card Component', () => {
  const mockOnClick = jest.fn()
  const user = setupUser()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('renders a face-down card by default', () => {
    const card = createMockCard()
    render(<Card card={card} onClick={mockOnClick} />)
    
    // Should show the back of the card (question mark)
    expect(screen.getByText('?')).toBeInTheDocument()
    expect(screen.queryByText(card.emoji)).not.toBeVisible()
  })

  it('renders a flipped card correctly', () => {
    const card = createMockCard({ isFlipped: true })
    render(<Card card={card} onClick={mockOnClick} />)
    
    // Should show the emoji
    expect(screen.getByText(card.emoji)).toBeVisible()
    expect(screen.getByRole('img', { name: `Emoji ${card.emoji}` })).toBeInTheDocument()
  })

  it('renders a matched card correctly', () => {
    const card = createMockCard({ isMatched: true })
    render(<Card card={card} onClick={mockOnClick} />)
    
    // Should show the emoji and have matched styling
    expect(screen.getByText(card.emoji)).toBeVisible()
    const cardElement = screen.getByRole('button')
    expect(cardElement).toHaveClass('bg-green-100')
    expect(cardElement).toHaveClass('border-green-300')
  })

  it('calls onClick when clicked', async () => {
    const card = createMockCard()
    render(<Card card={card} onClick={mockOnClick} />)
    
    const cardElement = screen.getByRole('button')
    await user.click(cardElement)
    
    expect(mockOnClick).toHaveBeenCalledWith(card.id)
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when card is flipped', async () => {
    const card = createMockCard({ isFlipped: true })
    render(<Card card={card} onClick={mockOnClick} />)
    
    const cardElement = screen.getByRole('button')
    await user.click(cardElement)
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when card is matched', async () => {
    const card = createMockCard({ isMatched: true })
    render(<Card card={card} onClick={mockOnClick} />)
    
    const cardElement = screen.getByRole('button')
    await user.click(cardElement)
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when disabled', async () => {
    const card = createMockCard()
    render(<Card card={card} onClick={mockOnClick} disabled />)
    
    const cardElement = screen.getByRole('button')
    await user.click(cardElement)
    
    expect(mockOnClick).not.toHaveBeenCalled()
    expect(cardElement).toHaveClass('cursor-not-allowed')
    expect(cardElement).toHaveClass('opacity-75')
  })

  it('supports keyboard navigation', async () => {
    const card = createMockCard()
    render(<Card card={card} onClick={mockOnClick} />)
    
    const cardElement = screen.getByRole('button')
    cardElement.focus()
    
    // Test Enter key
    await user.keyboard('{Enter}')
    expect(mockOnClick).toHaveBeenCalledWith(card.id)
    
    mockOnClick.mockClear()
    
    // Test Space key
    await user.keyboard(' ')
    expect(mockOnClick).toHaveBeenCalledWith(card.id)
  })

  it('has proper accessibility attributes', () => {
    const card = createMockCard()
    render(<Card card={card} onClick={mockOnClick} />)
    
    const cardElement = screen.getByRole('button')
    
    expect(cardElement).toHaveAttribute('aria-label', `Memory card ${card.id + 1}, click to flip`)
    expect(cardElement).toHaveAttribute('aria-pressed', 'false')
    expect(cardElement).toHaveAttribute('tabIndex', '0')
  })

  it('updates accessibility attributes when flipped', () => {
    const card = createMockCard({ isFlipped: true })
    render(<Card card={card} onClick={mockOnClick} />)
    
    const cardElement = screen.getByRole('button')
    
    expect(cardElement).toHaveAttribute('aria-label', `Flipped card: ${card.emoji}`)
    expect(cardElement).toHaveAttribute('aria-pressed', 'true')
    expect(cardElement).toHaveAttribute('tabIndex', '-1')
  })

  it('updates accessibility attributes when matched', () => {
    const card = createMockCard({ isMatched: true })
    render(<Card card={card} onClick={mockOnClick} />)
    
    const cardElement = screen.getByRole('button')
    
    expect(cardElement).toHaveAttribute('aria-label', `Matched card: ${card.emoji}`)
    expect(cardElement).toHaveAttribute('aria-pressed', 'true')
    expect(cardElement).toHaveAttribute('tabIndex', '-1')
  })

  it('applies hover effects when not disabled', () => {
    const card = createMockCard()
    render(<Card card={card} onClick={mockOnClick} />)
    
    const cardElement = screen.getByRole('button')
    expect(cardElement).toHaveClass('hover:scale-105')
    expect(cardElement).not.toHaveClass('cursor-not-allowed')
  })

  it('applies disabled styles when disabled', () => {
    const card = createMockCard()
    render(<Card card={card} onClick={mockOnClick} disabled />)
    
    const cardElement = screen.getByRole('button')
    expect(cardElement).toHaveClass('cursor-not-allowed')
    expect(cardElement).toHaveClass('opacity-75')
    expect(cardElement).not.toHaveClass('hover:scale-105')
  })
})