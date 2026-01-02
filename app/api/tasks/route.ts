import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TaskStatus } from '@prisma/client'
import { CreateTaskInput } from '@/types/task'

//get tasks, from filtering:
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as TaskStatus | null
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const orderBy = searchParams.get('orderBy') || 'desc'

    const where: any = {
      deleted_at: null,
    }

    if (status && (status === 'PENDING' || status === 'COMPLETED')) {
      where.status = status
    }

    const validSortFields = ['createdAt', 'updatedAt', 'title']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'

    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        [sortField]: orderBy === 'asc' ? 'asc' : 'desc',
      },
    })

    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// post, create task
export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskInput = await request.json()

    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and cannot be empty' },
        { status: 400 }
      )
    }

    if (body.title.length > 255) {
      return NextResponse.json(
        { error: 'Title must be 255 characters or less' },
        { status: 400 }
      )
    }

    if (body.description && body.description.length > 1000) {
      return NextResponse.json(
        { error: 'Description must be 1000 characters or less' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        status: body.status || 'PENDING',
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
