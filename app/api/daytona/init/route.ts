import { NextResponse } from 'next/server'
import { createSandboxWithVolume } from '@/lib/daytona'

export async function POST() {
  try {
    console.log('Initializing Daytona sandbox with claude-cloud volume...')

    const result = await createSandboxWithVolume()

    return NextResponse.json({
      success: true,
      message: 'Daytona volume initialized successfully (sandbox deleted after upload)',
      volumeId: result.volume.id,
    })
  } catch (error) {
    console.error('Error initializing Daytona:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to initialize Daytona sandbox',
  })
}
