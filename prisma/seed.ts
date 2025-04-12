import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем заполнение базы данных тестовыми данными...');

  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Администратор',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Создан администратор:', admin.email);

  const userPassword = await hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Тестовый пользователь',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log('Создан пользователь:', user.email);

  const categories = [
    'Фантастика',
    'Детективы',
    'Романы',
    'Наука',
    'Бизнес',
    'Психология',
    'История',
    'Биографии',
  ];

  await prisma.book.deleteMany({});
  console.log('Удалены все существующие книги');

  const books = [
    {
      title: '1984',
      author: 'Джордж Оруэлл',
      category: 'Фантастика',
      year: 1949,
      description: 'Роман-антиутопия, действие которого происходит в тоталитарном обществе. Один из самых известных романов XX века.',
      price: 650,
      rentalPrice: 120,
      imageUrl: 'https://via.placeholder.com/300x450?text=1984',
      isAvailable: true,
    },
    {
      title: 'Преступление и наказание',
      author: 'Федор Достоевский',
      category: 'Романы',
      year: 1866,
      description: 'Социально-психологический и социально-философский роман. Одно из самых известных произведений русской литературы.',
      price: 700,
      rentalPrice: 150,
      imageUrl: 'https://via.placeholder.com/300x450?text=Преступление+и+наказание',
      isAvailable: true,
    },
    {
      title: 'Гарри Поттер и философский камень',
      author: 'Дж. К. Роулинг',
      category: 'Фантастика',
      year: 1997,
      description: 'Первый роман в серии книг о юном волшебнике Гарри Поттере, написанный британской писательницей Дж. К. Роулинг.',
      price: 800,
      rentalPrice: 200,
      imageUrl: 'https://via.placeholder.com/300x450?text=Гарри+Поттер',
      isAvailable: true,
    },
    {
      title: 'Мастер и Маргарита',
      author: 'Михаил Булгаков',
      category: 'Романы',
      year: 1967,
      description: 'Роман, написанный Михаилом Булгаковым в период с 1928 по 1940 год, впервые опубликованный в сокращенном виде в журнале «Москва» в 1966-1967 годах.',
      price: 750,
      rentalPrice: 180,
      imageUrl: 'https://via.placeholder.com/300x450?text=Мастер+и+Маргарита',
      isAvailable: true,
    },
    {
      title: 'Убийство в Восточном экспрессе',
      author: 'Агата Кристи',
      category: 'Детективы',
      year: 1934,
      description: 'Один из самых известных детективных романов Агаты Кристи с участием Эркюля Пуаро.',
      price: 600,
      rentalPrice: 130,
      imageUrl: 'https://via.placeholder.com/300x450?text=Убийство+в+Восточном+экспрессе',
      isAvailable: true,
    },
    {
      title: 'Марсианин',
      author: 'Энди Вейр',
      category: 'Фантастика',
      year: 2011,
      description: 'Научно-фантастический роман, описывающий историю выживания американского астронавта Марка Уотни на Марсе.',
      price: 850,
      rentalPrice: 200,
      imageUrl: 'https://via.placeholder.com/300x450?text=Марсианин',
      isAvailable: true,
    },
    {
      title: 'Три товарища',
      author: 'Эрих Мария Ремарк',
      category: 'Романы',
      year: 1936,
      description: 'Роман о дружбе, любви и суровом послевоенном времени в Германии.',
      price: 720,
      rentalPrice: 160,
      imageUrl: 'https://via.placeholder.com/300x450?text=Три+товарища',
      isAvailable: true,
    },
    {
      title: 'Думай медленно... решай быстро',
      author: 'Даниэль Канеман',
      category: 'Психология',
      year: 2011,
      description: 'Книга нобелевского лауреата Даниэля Канемана, объясняющая два типа мышления, влияющих на наши решения.',
      price: 900,
      rentalPrice: 220,
      imageUrl: 'https://via.placeholder.com/300x450?text=Думай+медленно',
      isAvailable: true,
    },
    {
      title: 'Сапиенс. Краткая история человечества',
      author: 'Юваль Ной Харари',
      category: 'История',
      year: 2011,
      description: 'Книга рассказывает о том, как вид Homo Sapiens сумел выжить и преобразовать мир вокруг себя.',
      price: 950,
      rentalPrice: 230,
      imageUrl: 'https://via.placeholder.com/300x450?text=Сапиенс',
      isAvailable: true,
    },
    {
      title: 'Стив Джобс',
      author: 'Уолтер Айзексон',
      category: 'Биографии',
      year: 2011,
      description: 'Биография одного из основателей компании Apple, написанная на основе более сорока интервью с Джобсом и ста интервью с его родственниками, друзьями, коллегами.',
      price: 880,
      rentalPrice: 210,
      imageUrl: 'https://via.placeholder.com/300x450?text=Стив+Джобс',
      isAvailable: true,
    },
  ];

  for (const book of books) {
    await prisma.book.create({
      data: book,
    });
  }
  console.log(`Добавлено ${books.length} книг`);

  console.log('Заполнение базы данных завершено!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
