import { IdeaStatus } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../config/env";

const ideas = [
  // Smart Cities
  {
    title: "Adaptive Urban Lighting",
    problemStatement: "Traditional streetlights consume excessive energy by staying at full brightness even when streets are empty.",
    solution: "Implement AI-powered sensors that adjust lighting based on movement and weather conditions.",
    description: "These intelligent grid-connected streetlights use mesh networking to alert each other of oncoming pedestrians or vehicles, saving up to 60% on municipal energy costs.",
    image: "https://images.unsplash.com/photo-1549141074-ce7513511b0e?auto=format&fit=crop&q=80&w=800",
    categoryName: "Smart Cities",
  },
  {
    title: "IoT Waste Collection Efficiency",
    problemStatement: "Inefficient waste collection routes lead to fuel waste and overflow.",
    solution: "Smart bin sensors that alert central systems when trash levels reach 80%.",
    description: "Route optimization AI reduces landfill transportation costs and carbon footprint through dynamic logistics for sanitation vehicles.",
    image: "https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&q=80&w=800",
    categoryName: "Smart Cities",
  },

  // Sustainable Tourism
  {
    title: "Eco-Lodge Certification Platform",
    problemStatement: "Travelers struggle to verify the true sustainability practices of eco-hotels.",
    solution: "A blockchain-verifiable rating system for sustainable tourism services.",
    description: "Transparency in carbon footprint reporting, locally sourced materials, and fair-wage compliance for accommodations worldwide.",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800",
    categoryName: "Sustainable Tourism",
  },
  {
    title: "Local-Immersion Community Travel",
    problemStatement: "Mass tourism benefits large corporations but drains local communities.",
    solution: "Curated experiences that prioritize local hosts and small businesses.",
    description: "Regenerative travel models where tourism revenue directly funds community-led environmental restoration projects.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800",
    categoryName: "Sustainable Tourism",
  },

  // Marine Life
  {
    title: "Ocean Plastic Collection Drones",
    problemStatement: "Floating plastic islands are devastating marine biodiversity.",
    solution: "Autonomous solar-powered drones that collect surface-level ocean waste.",
    description: "These interceptors work synchronously to trap macro-plastics at river mouths before they ever reach the open ocean.",
    image: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&q=80&w=800",
    categoryName: "Marine Life",
  },
  {
    title: "Coral Reef Monitoring Sensors",
    problemStatement: "Global warming is causing devastating coral bleaching at an unprecedented speed.",
    solution: "Underwater IoT sensor networks monitoring ocean temp and pH levels.",
    description: "Real-time alerts for researchers to deploy cooling techniques or protective measures at sensitive reef sites.",
    image: "https://images.unsplash.com/photo-1546026423-cc0643f5f341?auto=format&fit=crop&q=80&w=800",
    categoryName: "Marine Life",
  },

  // Forestry
  {
    title: "Automated Reforestation Drones",
    problemStatement: "Manual tree-planting is too slow to combat global deforestation.",
    solution: "High-speed seed-bombing drones that reforest 100x faster than humans.",
    description: "Precision planting using geographic mapping to ensure survival rates through optimized soil placement.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
    categoryName: "Forestry",
  },
  {
    title: "Acoustic Guard Deforestation AI",
    problemStatement: "Illegal logging is often undetected until it's too late.",
    solution: "Solar-powered microphones using AI to detect chainsaws in rainforests.",
    description: "Immediate GPS-alerts to rangers reduce encroachment time from days to minutes, protecting thousands of acres.",
    image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800",
    categoryName: "Forestry",
  },

  // Climate Education
  {
    title: "Gamified Schools Carbon Tracker",
    problemStatement: "Sustainability education in schools lacks interactive and engaging delivery models.",
    solution: "An app that turns carbon footprint tracking into a competitive game for students.",
    description: "Schools compete globally on recycling rates, energy savings, and clean transit points with real rewards.",
    image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800",
    categoryName: "Climate Education",
  },
  {
    title: "Virtual Reality Climate Sim",
    problemStatement: "People struggle to grasp the future impacts of climate change on their local area.",
    solution: "Local-area specific VR simulations showing future climate projections.",
    description: "Connecting users emotionally to their environment by showing the direct impact of individual and local climate policies.",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800",
    categoryName: "Climate Education",
  },

  // Sustainable Packaging
  {
    title: "Mushroom-Based Compostable Boxes",
    problemStatement: "EPS Foam (Styrofoam) is non-biodegradable and chokes marine ecosystems.",
    solution: "Mycelium-based packaging that dissolves in garden compost after use.",
    description: "Strong, lightweight, and carbon-negative shipping protectors that replace plastic foam globally.",
    image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=800",
    categoryName: "Sustainable Packaging",
  },
  {
    title: "Seaweed-Derived Edible Film",
    problemStatement: "Single-use food wraps for produce generate massive industrial waste.",
    solution: "Edible packaging made from brown seaweed that dissolves in water.",
    description: "Odorless, tasteless, and nutritional packaging that extends shelf-life without chemical preservatives.",
    image: "https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e?auto=format&fit=crop&q=80&w=800",
    categoryName: "Sustainable Packaging",
  },

  // Eco-Transportation
  {
    title: "Hydrogen Long-Haul Transit",
    problemStatement: "Electric batteries are too heavy for effective cross-continent heavy freight.",
    solution: "Hydrogen-fuel-cell conversion kits for current semi-truck fleets.",
    description: "15-minute refill times and zero tailpipe emissions bring freight shipping into the sustainable era.",
    image: "https://images.unsplash.com/photo-1558231908-0a0684f1883c?auto=format&fit=crop&q=80&w=800",
    categoryName: "Eco-Transportation",
  },
  {
    title: "Solar-Powered Commuter Ferry",
    problemStatement: "Urban waterway transit relies on heavily polluting diesel engines.",
    solution: "Silent, hydrofoil-equipped catamarans powered by solar-roof arrays.",
    description: "Reducing commute times and urban noise pollution while providing clean, scenic morning transit.",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800",
    categoryName: "Eco-Transportation",
  },

  // Biodiversity
  {
    title: "Urban Pollinator Corridors",
    problemStatement: "Habitat fragmentation in cities causes rapid decline in bee and butterfly populations.",
    solution: "A city-wide map for residents to convert rooftops and balconies into corridors.",
    description: "Linking green spaces with flower clusters to ensure migration paths for essential urban pollinators.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    categoryName: "Biodiversity",
  },
  {
    title: "AI Wildlife-Crossing Radar",
    problemStatement: "Thousands of large mammals are killed daily in roadway collisions.",
    solution: "Near-infrared radar that alerts drivers of animals entering the road ahead.",
    description: "Low-cost integration for existing highway signage reduces animal-related accidents by over 80%.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    categoryName: "Biodiversity",
  },

  // Circular Economy
  {
    title: "Textile-to-Textile Recycler",
    problemStatement: "Less than 1% of clothing is actually recycled into new garments annually.",
    solution: "Closed-loop mechanical fiber separating tech for discarded post-consumer items.",
    description: "Creating high-quality virgin-like fabric from old cotton and polyester blends for major fashion brands.",
    image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800",
    categoryName: "Circular Economy",
  },
  {
    title: "Industrial Tool Sharing Platform",
    problemStatement: "Specialized construction machinery is often idle 90% of its lifespan.",
    solution: "A B2B rental marketplace for idle heavy industrial equipment.",
    description: "Reducing new machine production and associated carbon while lowering project costs for small contractors.",
    image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800",
    categoryName: "Circular Economy",
  },

  // Sustainable Agriculture
  {
    title: "AI Precision Irrigation",
    problemStatement: "Global agriculture is the leading consumer of our dwindling freshwater supply.",
    solution: "Hyperspectral imaging to deliver water exactly where and when plants need it.",
    description: "Reducing water consumption by 50% while simultaneously increasing crop yields through stress-prevention AI.",
    image: "https://images.unsplash.com/photo-1523348830708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800",
    categoryName: "Sustainable Agriculture",
  },
  {
    title: "Vertical Aeroponic Towers",
    problemStatement: "Conventional soil-farming requires massive land use and logistics for urban centers.",
    solution: "No-soil vertical grow systems that use 95% less water than soil.",
    description: "Fresh produce grown directly inside restaurant basements and city skyscrapers, eliminating transport emissions.",
    image: "https://images.unsplash.com/photo-1523348830708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800",
    categoryName: "Sustainable Agriculture",
  },

  // Clean Water
  {
    title: "Fog-Harvesting Mesh Systems",
    problemStatement: "Coastal arid regions lack reliable rain or groundwater.",
    solution: "Large vertical stainless-steel mesh that traps water from passing mist.",
    description: "Gravity-fed clean water for entire mountain and coastal villages at near-zero operating cost.",
    image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&q=80&w=800",
    categoryName: "Clean Water",
  },
  {
    title: "Solar-Powered Desalination",
    problemStatement: "Current ocean desalination plants consume massive amounts of fossil fuel energy.",
    solution: "Low-heat vacuum systems powered entirely by solar concentrators.",
    description: "Scalable clean water for island nations without the environmental toll of traditional energy grids.",
    image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&q=80&w=800",
    categoryName: "Clean Water",
  },

  // Green Building
  {
    title: "Passive Cooling Bio-Phase",
    problemStatement: "Air-conditioning accounts for massive energy spikes during summer months.",
    solution: "Phase-change bio-material integrated into walls that absorb heat during the day.",
    description: "Releasing cool temperature at night without electricity, reducing AC dependency by up to 40%.",
    image: "https://images.unsplash.com/photo-1518005020251-0eb5c1842971?auto=format&fit=crop&q=80&w=800",
    categoryName: "Green Building",
  },
  {
    title: "Micro-Green Rooftop Retrofits",
    problemStatement: "Concrete urban environments act as heat islands.",
    solution: "Interlocking modular green trays for rapid roof conversion.",
    description: "Absorbing sunlight for cooling while purifying air and providing micro-habitats for birds and bees.",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800",
    categoryName: "Green Building",
  },

  // Sustainable Fashion
  {
    title: "Apple-Skin Bio-Leather",
    problemStatement: "Traditional leather is resource-intensive and chareged with ethical/biological concerns.",
    solution: "High-durability leather alternative made from commercial apple waste.",
    description: "Water-resistant, biodegradable, and utilizes industrial byproducts from the juice industry.",
    image: "https://images.unsplash.com/photo-1581404917829-5731213bc2bc?auto=format&fit=crop&q=80&w=800",
    categoryName: "Sustainable Fashion",
  },
  {
    title: "Token-Based Clothes Swap",
    problemStatement: "Fast-fashion leads to millons of tons of wearable clothing reaching landfills.",
    solution: "A local-neighborhood app for authenticated garment rotation.",
    description: "Users earn tokens for donating quality items, fostering a shared community closet and reducing new purchases.",
    image: "https://images.unsplash.com/photo-1581404917829-5731213bc2bc?auto=format&fit=crop&q=80&w=800",
    categoryName: "Sustainable Fashion",
  },

  // Waste Management
  {
    title: "Robotic AI Waste Sorting",
    problemStatement: "Human sorting is slow and leads to massive cross-contamination in recycling streams.",
    solution: "Hyperspectral and tactile AI arms for ultra-fast conveyor sorting.",
    description: "Increasing landfill diversion by 40% through precise separation of plastic polymers and clean mixed paper.",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
    categoryName: "Waste Management",
  },
  {
    title: "Local Community Composting",
    problemStatement: "Organic waste in landfills produces methane, a potent greenhouse gas.",
    solution: "Distributed neighborhood aerobic digestion units for organic waste.",
    description: "Converting kitchen scraps into gold-standard soil for local urban gardens while reducing truck logic trips.",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
    categoryName: "Waste Management",
  },

  // Renewable Energy
  {
    title: "High-Altitude Kite Wind",
    problemStatement: "Traditional wind turbines are geographically limited and expensive to build.",
    solution: "Autonomous kites that capture high-velocity winds at 1000+ feet.",
    description: "Compact, portable, and capable of generating power for remote island regions without massive infrastructure.",
    image: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=800",
    categoryName: "Renewable Energy",
  },
  {
    title: "Solar Perovskite Glass",
    problemStatement: "Solar panels typically require dedicated land or roof-space.",
    solution: "Semi-transparent solar coating for sky-scraper windows.",
    description: "Turning the vast surface area of modern cities into active power-generating engines without altering appearance.",
    image: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=800",
    categoryName: "Renewable Energy",
  },

  // zoro carbon
  {
    title: "Carbon Capture Concrete",
    problemStatement: "Concrete production is responsible for 8% of all global carbon emissions.",
    solution: "Curing concrete with injected carbon instead of water, permanent storage.",
    description: "A carbon-negative building material that is stronger and more durable than traditional cement.",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800",
    categoryName: "zoro carbon",
  },
  {
    title: "Home Carbon Sequestration",
    problemStatement: "Atmospheric CO2 is rising and most capture systems are industrial scale.",
    solution: "Decorative kelp-based vertical bi-reactors for home carbon capture.",
    description: "Purifying air for residents while capturing carbon through rapid-growth algae, creating fertilizer after harvest.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    categoryName: "zoro carbon",
  },
];

export async function ideaSeed() {
  console.log("🌱 Seeding professional sustainability ideas...");

  // 1. Fetch categories to create a name-to-id map
  const dbCategories = await prisma.category.findMany();
  const categoryMap = new Map(dbCategories.map((c) => [c.name, c.id]));

  // 2. Fetch admin user to use as author
  const adminUser = await prisma.user.findUnique({
    where: { email: envVars.ADMIN_EMAIL },
  });

  if (!adminUser) {
    console.error("❌ Admin user not found. Please seed admin first.");
    return;
  }

  // 3. Check if we already have ideas to avoid duplicates (since no unique title)
  const existingCount = await prisma.idea.count();
  if (existingCount > 0) {
    console.log("⏭️ Ideas already exist. Skipping seed.");
    return;
  }

  for (const ideaData of ideas) {
    try {
      const { categoryName, ...idea } = ideaData;
      const categoryId = categoryMap.get(categoryName);

      if (!categoryId) {
        console.warn(`⚠️ Category not found: ${categoryName}. Skipping idea: ${idea.title}`);
        continue;
      }

      const isPaid = Math.random() > 0.8;
      const price = isPaid ? 59.99 : null;

      await prisma.idea.create({
        data: {
          ...idea,
          status: IdeaStatus.APPROVED,
          authorId: adminUser.id,
          categoryId,
          isFeatured: Math.random() > 0.7,
          isPaid,
          price,
        },
      });
    } catch (error) {
      console.error(`❌ Failed to seed idea: ${ideaData.title}`, error);
    }
  }

  console.log("✅ Seeding of ideas completed successfully!");
}
