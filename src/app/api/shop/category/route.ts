import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.shopCategory.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        _count: {
          select: { shops: true },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, imageUrl } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const category = await prisma.shopCategory.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        imageUrl: imageUrl || null,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { shops: true },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (name && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    if (slug && (typeof slug !== 'string' || slug.trim() === '')) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const category = await prisma.shopCategory.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        slug: slug ? slug.trim() : undefined,
        imageUrl: imageUrl || null,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { shops: true },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if category is referenced by shops
    const shopCount = await prisma.shop.count({ where: { categoryId: id } });
    if (shopCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category: It is referenced by shops' },
        { status: 400 }
      );
    }

    await prisma.shopCategory.delete({ where: { id } });
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}