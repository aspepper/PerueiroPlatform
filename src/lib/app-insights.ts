import type { TelemetryClient } from 'applicationinsights'

let client: TelemetryClient | null = null

const connectionString = [
  'APPINSIGHTS_CONNECTION_STRING',
  'APPLICATIONINSIGHTS_CONNECTION_STRING',
  'APPINSIGHTS_INSTRUMENTATIONKEY',
  'APPLICATIONINSIGHTS_INSTRUMENTATIONKEY',
  'APPLICATIONINSIGHTS_INSTRUMENTATION_KEY',
]
  .map((key) => process.env[key])
  .find((value): value is string => Boolean(value))

if (connectionString) {
  try {
    const appInsights = (
      eval('require') as (moduleName: string) => unknown
    )('applicationinsights') as typeof import('applicationinsights')

    appInsights
      .setup(connectionString)
      .setAutoCollectConsole(true, true)
      .start()

    client = appInsights.defaultClient
  } catch (error) {
    console.warn('Application Insights could not be initialized.', error)
  }
}

export const telemetryClient = client
