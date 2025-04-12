import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { startOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const totalBooks = await prisma.book.count();

    const totalUsers = await prisma.user.count();

    const activeRentals = await prisma.rental.count({
      where: {
        isReturned: false,
      },
    });

    const currentMonth = startOfMonth(new Date());
    const ordersThisMonth = await prisma.order.count({
      where: {
        status: "PAID",
        createdAt: {
          gte: currentMonth,
        },
      },
    });

    return NextResponse.json({
      totalBooks,
      totalUsers,
      activeRentals,
      ordersThisMonth,
    });
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
