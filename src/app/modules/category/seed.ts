import { prisma } from "../../lib/prisma";

const categories = [
  {
    name: "Renewable Energy",
    image: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Waste Management",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sustainable Fashion",
    image: "https://images.unsplash.com/photo-1581404917829-5731213bc2bc?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Green Building",
    image: "https://images.unsplash.com/photo-1518005020251-0eb5c1842971?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Clean Water",
    image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sustainable Agriculture",
    image: "https://images.unsplash.com/photo-1523348830708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Circular Economy",
    image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Biodiversity",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Eco-Transportation",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sustainable Packaging",
    image: "https://images.unsplash.com/photo-1605600611284-195205ef91b2?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Climate Education",
    image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Forestry",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Marine Life",
    image: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sustainable Tourism",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Smart Cities",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800",
  },
];

export async function catSeed() {
  console.log("🌱 Seeding sustainability categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { image: category.image },
      create: {
        name: category.name,
        image: category.image,
      },
    });
  }
  console.log("✅ Seeding completed successfully!");
}
