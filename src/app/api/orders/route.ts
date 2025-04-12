import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// Получение всех заказов пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: { not: "PENDING" }, // Исключаем текущую корзину
      },
      include: {
        orderItems: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Ошибка получения заказов:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Оформление заказа
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Необходимо указать ID заказа" },
        { status: 400 }
      );
    }

    // Проверяем, что заказ существует и принадлежит пользователю
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
        status: "PENDING",
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Заказ не найден или уже оформлен" },
        { status: 404 }
      );
    }

    if (order.orderItems.length === 0) {
      return NextResponse.json(
        { error: "В заказе нет товаров" },
        { status: 400 }
      );
    }

    // Обновляем статус заказа на "PAID"
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Ошибка оформления заказа:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
