import '@testing-library/jest-dom'

// Mock crypto.randomUUID for tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
})

// Mock Intl.DateTimeFormat
Object.defineProperty(global, 'Intl', {
  value: {
    DateTimeFormat: () => ({
      resolvedOptions: () => ({
        timeZone: 'America/Sao_Paulo'
      })
    })
  }
})
