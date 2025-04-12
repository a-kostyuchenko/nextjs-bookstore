import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const books = await prisma.book.findMany({
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Ошибка получения книг:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const bookData = await request.json();

    const requiredFields = ["title", "author", "category", "year", "description", "price", "rentalPrice"];
    for (const field of requiredFields) {
      if (!bookData[field]) {
        return NextResponse.json(
          { error: `Поле '${field}' обязательно` },
          { status: 400 }
        );
      }
    }

    const book = await prisma.book.create({
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

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Ошибка создания книги:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
