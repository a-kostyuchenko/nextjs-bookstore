import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const book = await prisma.book.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Книга не найдена" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Ошибка получения книги:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const bookData = await request.json();

    // Валидация данных
    const requiredFields = ["title", "author", "category", "year", "description", "price", "rentalPrice"];
    for (const field of requiredFields) {
      if (!bookData[field]) {
        return NextResponse.json(
          { error: `Поле '${field}' обязательно` },
          { status: 400 }
        );
      }
    }

    const existingBook = await prisma.book.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Книга не найдена" }, { status: 404 });
    }

    const updatedBook = await prisma.book.update({
      where: {
        id: params.id,
      },
      data: {
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        year: bookData.year,
        description: bookData.description,
        price: bookData.price,
        rentalPrice: bookData.rentalPrice,
        imageUrl: bookData.imageUrl || null,
        isAvailable: bookData.isAvailable ?? true,
      },
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Ошибка обновления книги:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const updateData = await request.json();

    // Проверяем, существует ли книга
    const existingBook = await prisma.book.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Книга не найдена" }, { status: 404 });
    }

    const updatedBook = await prisma.book.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Ошибка обновления книги:", error);
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

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const existingBook = await prisma.book.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Книга не найдена" }, { status: 404 });
    }

    await prisma.book.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления книги:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
