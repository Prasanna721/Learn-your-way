export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createSandboxWithVolume } = await import('./lib/daytona')

    try {
      console.log('🚀 Server starting - Initializing Daytona volume...')
      await createSandboxWithVolume()
      console.log('✅ Daytona volume initialized successfully (sandbox deleted)')
    } catch (error) {
      console.error('❌ Error initializing Daytona on server start:', error)
      // Don't throw - allow server to start even if Daytona fails
      console.warn('⚠️  Server will continue without Daytona volume')
    }
  }
}
