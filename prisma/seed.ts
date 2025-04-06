import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Vorhandene Todos löschen (optional, aber oft nützlich für wiederholtes Seeding)
  await prisma.todo.deleteMany();
  console.log("Deleted existing todos.");

  // Beispiel-Todos erstellen
  const todo1 = await prisma.todo.create({
    data: { title: "Learn Tanstack Query" },
  });
  const todo2 = await prisma.todo.create({
    data: { title: "Master Server Actions", completed: true },
  });
  const todo3 = await prisma.todo.create({
    data: { title: "Write Blog Post" },
  });

  console.log({ todo1, todo2, todo3 });
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
