import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { addDays } from "date-fns";

function getEndDate(rentalPeriod: string): Date {
  const now = new Date();

  switch (rentalPeriod) {
    case "TWO_WEEKS":
      return addDays(now, 14);
    case "ONE_MONTH":
      return addDays(now, 30);
    case "THREE_MONTHS":
      return addDays(now, 90);
    default:
      return addDays(now, 14); // По умолчанию 2 недели
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const rentals = await prisma.rental.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Ошибка получения аренд:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { bookId, rentalPeriod } = await request.json();

    if (!bookId || !rentalPeriod) {
      return NextResponse.json(
        { error: "Необходимо указать ID книги и период аренды" },
        { status: 400 }
      );
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId, isAvailable: true },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Книга не найдена или недоступна" },
        { status: 404 }
      );
    }

    const existingRental = await prisma.rental.findFirst({
      where: {
        userId: session.user.id,
        bookId: book.id,
        isReturned: false,
      },
    });

    if (existingRental) {
      return NextResponse.json(
        { error: "Вы уже арендовали эту книгу" },
        { status: 400 }
      );
    }

    const endDate = getEndDate(rentalPeriod);

    const rental = await prisma.rental.create({
      data: {
        userId: session.user.id,
        bookId: book.id,
        endDate,
        rentalPeriod: rentalPeriod as any,
        reminderSent: false,
      },
    });

    return NextResponse.json({ success: true, rentalId: rental.id });
  } catch (error) {
    console.error("Ошибка создания аренды:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
