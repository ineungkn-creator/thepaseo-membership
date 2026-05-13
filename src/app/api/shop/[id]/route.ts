import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type ShopWithRelations = Prisma.ShopGetPayload<{
  include: {
    branch: true;
    category: true;
    hours: true;
    rewards: {
      include: {
        branches: true;
        shops: true;
        participations: true;
      };
    };
    event: {
      include: {
        branches: true;
        shops: true;
        registrations: true;
      };
    };
    coupon: {
      include: {
        branches: true;
        shops: true;
      };
    };
  };
}>;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        branch: true,
        category: true,
        hours: {
          orderBy: { dayOfWeek: "asc" },
        },
        rewards: {
          include: {
            branches: true,
            shops: true,
            participations: true,
          },
        },
        event: {
          include: {
            branches: true,
            shops: true,
            registrations: true,
          },
        },
        coupon: {
          include: {
            branches: true,
            shops: true,
          },
        },
      },
    }) as ShopWithRelations | null;

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const formattedShop = {
      ...shop,
      rewards: shop.rewards
        .filter(reward => reward.endDate && reward.endDate >= new Date())
        .map(reward => ({
          ...reward,
          participantCount: reward.participations.length,
        })),
      event: shop.event
        .filter(event => event.endDate && event.endDate >= new Date())
        .map(event => ({
          ...event,
          registrations: event.registrations.length,
        })),
      coupon: shop.coupon
        .filter(coupon => coupon.endDate && coupon.endDate >= new Date())
        .map(coupon => ({ ...coupon })),
    };

    return NextResponse.json(formattedShop);

  } catch (error) {
    console.error('Error fetching shop:', error);
    return NextResponse.json({ error: 'Failed to fetch shop' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const shop = await prisma.shop.update({
      where: { id },
      data,
    });
    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.shop.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json({ error: 'Failed to delete shop' }, { status: 500 });
  }
}