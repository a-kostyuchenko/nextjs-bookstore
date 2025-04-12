import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// Получение корзины пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Ищем незавершенный заказ пользователя
    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
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
    });

    if (!order) {
      // Если корзина пуста, возвращаем пустой заказ
      return NextResponse.json({
        id: null,
        totalAmount: 0,
        orderItems: [],
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Ошибка получения корзины:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Добавление книги в корзину (создание заказа)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { bookId, quantity } = await request.json();

    if (!bookId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Необходимо указать ID книги и количество" },
        { status: 400 }
      );
    }

    // Проверяем, что книга существует и доступна
    const book = await prisma.book.findUnique({
      where: { id: bookId, isAvailable: true },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Книга не найдена или недоступна" },
        { status: 404 }
      );
    }

    // Проверяем, есть ли уже корзина с неоплаченным заказом
    let order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      // Создаем новый заказ
      order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          totalAmount: book.price * quantity,
          orderItems: {
            create: {
              bookId: book.id,
              quantity: quantity,
              price: book.price,
            },
          },
        },
        include: {
          orderItems: true,
        },
      });
    } else {
      // Проверяем, есть ли уже эта книга в заказе
      const existingItem = order.orderItems.find(
        (item) => item.bookId === book.id
      );

      if (existingItem) {
        // Обновляем количество
        await prisma.orderItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
          },
        });
      } else {
        // Добавляем новую книгу в заказ
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            bookId: book.id,
            quantity: quantity,
            price: book.price,
          },
        });
      }

      // Обновляем общую сумму заказа
      const updatedOrderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      });

      const newTotalAmount = updatedOrderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await prisma.order.update({
        where: { id: order.id },
        data: { totalAmount: newTotalAmount },
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Ошибка добавления в корзину:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
