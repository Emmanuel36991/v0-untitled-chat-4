import { useState, useCallback } from "react"

export type AdvisorType = "trade" | "statistic"

interface AdvisorState {
  isOpen: boolean
  title: string
  type: AdvisorType
  data: any
  context?: string
}

const initialState: AdvisorState = {
  isOpen: false,
  title: "",
  type: "trade",
  data: null,
  context: undefined,
}

export function useAIAdvisor() {
  const [state, setState] = useState<AdvisorState>(initialState)

  const openAdvisor = useCallback(
    (title: string, type: AdvisorType, data: any, context?: string) => {
      setState({
        isOpen: true,
        title,
        type,
        data,
        context,
      })
    },
    []
  )

  const closeAdvisor = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return {
    // State
    isOpen: state.isOpen,
    
    // Actions
    openAdvisor,
    closeAdvisor,
    
    // Helper to spread props directly onto the AdvisorPanel component
    advisorProps: {
      isOpen: state.isOpen,
      onClose: closeAdvisor,
      title: state.title,
      type: state.type,
      data: state.data,
      context: state.context,
    },
  }
}
