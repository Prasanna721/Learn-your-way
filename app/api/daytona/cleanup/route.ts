import { NextResponse } from 'next/server'
import { cleanupSandbox } from '@/lib/daytona'

export async function POST() {
  try {
    console.log('Cleaning up Daytona sandbox...')
    await cleanupSandbox()

    return NextResponse.json({
      success: true,
      message: 'Daytona sandbox cleaned up successfully',
    })
  } catch (error) {
    console.error('Error cleaning up Daytona:', error)

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
    message: 'Use POST to cleanup Daytona sandbox',
  })
}
