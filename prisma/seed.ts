import { PrismaClient, Industry } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const firstNames = ["James","Amara","David","Sarah","Chidi","Grace","Emmanuel","Fatima","Daniel","Blessing","Michael","Ngozi","Samuel","Adaeze","Joshua","Chioma","Elijah","Miriam","Isaac","Deborah","Aaron","Esther","Caleb","Ruth","Nathan","Priscilla","Solomon","Abigail","Gideon","Lydia"];
const lastNames = ["Okafor","Chen","Williams","Jenkins","Adeyemi","Mensah","Osei","Nwosu","Afolabi","Diallo","Owusu","Balogun","Eze","Asante","Musa","Dike","Onyeka","Kamara","Banda","Okeke","Traoré","Abubakar","Nkrumah","Olawale","Ihejirika","Sow","Conteh","Achebe","Obiora","Fadahunsi"];

const industries: Industry[] = ["PASTOR","ENTREPRENEUR","DOCTOR","ENGINEER","LAWYER","EDUCATOR","FINANCE","TECH","CREATIVE","REAL_ESTATE","HEALTHCARE","MEDIA","OTHER"];

const jobTitles: Record<Industry, string[]> = {
  PASTOR: ["Senior Pastor","Associate Pastor","Youth Pastor","Worship Leader"],
  ENTREPRENEUR: ["Founder & CEO","Co-Founder","Managing Director","Business Owner"],
  DOCTOR: ["Medical Doctor","Consultant Physician","Surgeon","Pediatrician"],
  ENGINEER: ["Software Engineer","Civil Engineer","Mechanical Engineer","Electrical Engineer"],
  LAWYER: ["Senior Advocate","Corporate Lawyer","Legal Counsel","Barrister"],
  EDUCATOR: ["Professor","Lecturer","School Principal","Academic Director"],
  FINANCE: ["CFO","Investment Banker","Financial Analyst","Accountant"],
  TECH: ["CTO","Product Manager","Data Scientist","DevOps Engineer"],
  CREATIVE: ["Creative Director","Graphic Designer","Art Director","Photographer"],
  REAL_ESTATE: ["Property Developer","Real Estate Agent","Estate Manager","Architect"],
  HEALTHCARE: ["Nurse Practitioner","Pharmacist","Public Health Officer","Therapist"],
  MEDIA: ["Journalist","TV Presenter","Content Creator","Media Executive"],
  OTHER: ["Consultant","Project Manager","Operations Lead","Strategist"],
};

const companies = ["Stellar Horizon","Grace & Co","Lumina Studios","Apex Ventures","Kingdom Builders","TechBridge Africa","Covenant Group","Pinnacle Health","Zion Media","Heritage Law","Cornerstone Realty","Elevate Finance","Nexus Engineering","Radiant Creative","Providence Consulting"];

const bios = [
  "Passionate about building communities that last. Always looking to connect with purpose-driven people.",
  "Focused on creating impact through innovation and faith. Let's build something great together.",
  "Helping businesses grow while staying rooted in values. Open to meaningful conversations.",
  "Dedicated to excellence in everything I do. Believer, builder, and connector.",
  "Bridging the gap between technology and humanity. Love meeting new people.",
  "Serving with purpose and leading with integrity. Always open to collaboration.",
  "Transforming ideas into reality. Passionate about people and possibilities.",
  "Faith-driven professional with a heart for community development.",
  "Building the future one connection at a time. Let's talk.",
  "Committed to excellence, driven by purpose, guided by faith.",
];

const funFacts = [
  "Speaks 3 languages, Cooked jollof for 200+ people",
  "Read the Bible 4x cover to cover, Sings in a choir",
  "Started first business at 16, Visited 12 countries",
  "Holds a black belt, Ran a half marathon untrained",
  "Self-taught coder, Bakes sourdough every Sunday",
  "Once met a sitting president, Has an unpublished book",
  "Has a twin in a different field, Can name every African country",
  "Solves Rubik's cube in 2 mins, Speaks Yoruba and Igbo",
  "Played semi-pro football, Now runs a tech startup",
  "Former choir director, Current real estate investor",
];

// Nigerian states and sample LGAs/areas for seeding
const stateLocations: { state: string; lga: string; area: string }[] = [
  { state: "Lagos", lga: "Eti-Osa", area: "Ikoyi" },
  { state: "Lagos", lga: "Eti-Osa", area: "Victoria Island" },
  { state: "Lagos", lga: "Eti-Osa", area: "Lekki Phase 1" },
  { state: "Lagos", lga: "Eti-Osa", area: "Ajah" },
  { state: "Lagos", lga: "Surulere", area: "Surulere" },
  { state: "Lagos", lga: "Lagos Mainland", area: "Yaba" },
  { state: "Lagos", lga: "Ikeja", area: "GRA Ikeja" },
  { state: "Lagos", lga: "Kosofe", area: "Magodo" },
  { state: "Lagos", lga: "Ajeromi-Ifelodun", area: "Festac Town" },
  { state: "Lagos", lga: "Lagos Island", area: "Isale-Eko" },
  { state: "FCT", lga: "Municipal Area Council", area: "Maitama" },
  { state: "FCT", lga: "Municipal Area Council", area: "Wuse 2" },
  { state: "FCT", lga: "Bwari", area: "Gwarinpa" },
  { state: "Rivers", lga: "Port Harcourt", area: "GRA Phase 2" },
  { state: "Rivers", lga: "Port Harcourt", area: "Trans-Amadi" },
  { state: "Oyo", lga: "Ibadan North", area: "Bodija" },
  { state: "Oyo", lga: "Ibadan North", area: "Jericho" },
  { state: "Enugu", lga: "Enugu North", area: "GRA" },
  { state: "Anambra", lga: "Onitsha North", area: "Onitsha GRA" },
  { state: "Delta", lga: "Oshimili South", area: "Asaba GRA" },
];

const sexOptions = ["Male", "Female"];
const genotypeOptions = ["AA", "AS", "SS", "AC"];
const lookingForOptions = ["Friendship","Networking","Mentorship","Business Partner","Community","Just connecting"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function phone(): string {
  return `+234 ${Math.floor(700 + Math.random() * 100)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`;
}

async function main() {
  console.log("Seeding 50 profiles...");

  await prisma.profile.deleteMany({
    where: { sessionKey: { startsWith: "seed-" } },
  });

  for (let i = 0; i < 50; i++) {
    const name = `${pick(firstNames)} ${pick(lastNames)}`;
    const industry = pick(industries);
    const jobTitle = pick(jobTitles[industry]);
    const company = pick(companies);
    const location = pick(stateLocations);

    await prisma.profile.create({
      data: {
        name,
        phone: phone(),
        bio: pick(bios),
        funFact: pick(funFacts),
        city: location.lga,
        stateOfOrigin: location.state,
        area: location.area,
        sex: pick(sexOptions),
        genotype: pick(genotypeOptions),
        lookingFor: pick(lookingForOptions),
        jobTitle,
        company,
        industry,
        sessionKey: `seed-${i}-${Date.now()}`,
      },
    });
  }

  console.log("Done — 50 profiles created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
