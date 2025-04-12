import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const rental = await prisma.rental.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: "Аренда не найдена" },
        { status: 404 }
      );
    }

    if (rental.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    if (rental.isReturned) {
      return NextResponse.json(
        { error: "Книга уже возвращена" },
        { status: 400 }
      );
    }

    const updatedRental = await prisma.rental.update({
      where: {
        id: params.id,
      },
      data: {
        isReturned: true,
      },
    });

    return NextResponse.json(updatedRental);
  } catch (error) {
    console.error("Ошибка возврата книги:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
