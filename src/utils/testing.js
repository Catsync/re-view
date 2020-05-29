import React from 'react'
import { render } from '@testing-library/react'
import { StateProvider, DEFAULT_CONTEXT } from '../context/state'

export const renderWithProviders = (ui, { context, ...options } = {}) => {
  const mockContext = {
    ...DEFAULT_CONTEXT,
    ...context,
  }

  const ProvidersWrapper = (props) => {
    return <StateProvider initialContext={mockContext} {...props} />
  }

  return render(ui, { wrapper: ProvidersWrapper, ...options })
}

export * from '@testing-library/react'
