import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { addDays, isPast, isWithinInterval } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    const upcomingExpirations = await prisma.rental.findMany({
      where: {
        isReturned: false,
        reminderSent: false,
        endDate: {
          lte: threeDaysFromNow,
          gt: now,
        },
      },
      include: {
        user: true,
        book: true,
      },
    });

    const overdueRentals = await prisma.rental.findMany({
      where: {
        isReturned: false,
        reminderSent: false,
        endDate: {
          lt: now,
        },
      },
      include: {
        user: true,
        book: true,
      },
    });

    const reminderIds = [
      ...upcomingExpirations.map((rental) => rental.id),
      ...overdueRentals.map((rental) => rental.id),
    ];

    if (reminderIds.length > 0) {
      await prisma.rental.updateMany({
        where: {
          id: {
            in: reminderIds,
          },
        },
        data: {
          reminderSent: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      upcoming: upcomingExpirations.length,
      overdue: overdueRentals.length,
      total: reminderIds.length,
    });
  } catch (error) {
    console.error("Ошибка обработки уведомлений об аренде:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
