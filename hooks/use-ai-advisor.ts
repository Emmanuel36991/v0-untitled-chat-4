import { useState, useCallback } from 'react'

export function useAIAdvisor() {
  const [isOpen, setIsOpen] = useState(false)
  const [advisorData, setAdvisorData] = useState<{
    title: string
    type: 'trade' | 'statistic'
    data: any
    context?: string
  } | null>(null)

  const openTradeAdvisor = useCallback((trade: any) => {
    setAdvisorData({
      title: `Trade Analysis - ${trade.setup_name || 'Trade'} (${trade.outcome.toUpperCase()})`,
      type: 'trade',
      data: trade,
      context: `This trade was on ${trade.instrument} in ${trade.direction} direction.`,
    })
    setIsOpen(true)
  }, [])

  const openStatisticAdvisor = useCallback(
    (name: string, value: any, context?: string) => {
      setAdvisorData({
        title: `${name} Analysis`,
        type: 'statistic',
        data: { name, value, context },
        context,
      })
      setIsOpen(true)
    },
    []
  )

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    advisorData,
    openTradeAdvisor,
    openStatisticAdvisor,
    close,
  }
}
