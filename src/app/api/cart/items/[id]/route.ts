import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Количество должно быть больше 0" },
        { status: 400 }
      );
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: params.id },
      include: { order: true },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Товар не найден" },
        { status: 404 }
      );
    }

    if (orderItem.order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: params.id },
      data: { quantity },
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: orderItem.order.id },
    });

    const newTotalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await prisma.order.update({
      where: { id: orderItem.order.id },
      data: { totalAmount: newTotalAmount },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Ошибка обновления товара в корзине:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: params.id },
      include: { order: true },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Товар не найден" },
        { status: 404 }
      );
    }

    if (orderItem.order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    await prisma.orderItem.delete({
      where: { id: params.id },
    });

    const remainingItems = await prisma.orderItem.findMany({
      where: { orderId: orderItem.order.id },
    });

    if (remainingItems.length === 0) {
      await prisma.order.delete({
        where: { id: orderItem.order.id },
      });
    } else {
      const newTotalAmount = remainingItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await prisma.order.update({
        where: { id: orderItem.order.id },
        data: { totalAmount: newTotalAmount },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления товара из корзины:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
