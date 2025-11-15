import { NextResponse } from 'next/server'
import { getSandbox, getDaytona } from '@/lib/daytona'

export async function GET() {
  try {
    const sandbox = await getSandbox()
    const daytona = getDaytona()

    if (!daytona) {
      return NextResponse.json({
        initialized: false,
        message: 'Daytona not initialized',
      })
    }

    if (!sandbox) {
      return NextResponse.json({
        initialized: true,
        sandboxActive: false,
        message: 'Daytona initialized but no active sandbox',
      })
    }

    return NextResponse.json({
      initialized: true,
      sandboxActive: true,
      sandboxId: sandbox.id,
      message: 'Daytona sandbox is active',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
