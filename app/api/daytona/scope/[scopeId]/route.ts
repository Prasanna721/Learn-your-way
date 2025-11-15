import { NextResponse } from 'next/server'
import { createScopeSandbox } from '@/lib/daytona'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ scopeId: string }> }
) {
  try {
    const { scopeId } = await params

    console.log(`Initializing Daytona sandbox for scope: ${scopeId}`)

    const result = await createScopeSandbox(scopeId)

    return NextResponse.json({
      success: true,
      message: `Sandbox initialized for scope: ${scopeId}`,
      sandboxId: result.sandbox.id,
      volumeId: result.volume.id,
      execSessionId: result.execSessionId,
      sandbox: result.sandbox,
    })
  } catch (error) {
    console.error('Error initializing scope sandbox:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
