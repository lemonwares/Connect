import { PrismaClient, Industry } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const firstNames = ["James", "Amara", "David", "Sarah", "Chidi", "Grace", "Emmanuel", "Fatima", "Daniel", "Blessing", "Michael", "Ngozi", "Samuel", "Adaeze", "Joshua", "Chioma", "Elijah", "Miriam", "Isaac", "Deborah", "Aaron", "Esther", "Caleb", "Ruth", "Nathan", "Priscilla", "Solomon", "Abigail", "Gideon", "Lydia"];
const lastNames = ["Okafor", "Chen", "Williams", "Jenkins", "Adeyemi", "Mensah", "Osei", "Nwosu", "Afolabi", "Diallo", "Owusu", "Balogun", "Eze", "Asante", "Musa", "Dike", "Onyeka", "Kamara", "Banda", "Okeke", "Traoré", "Abubakar", "Nkrumah", "Olawale", "Ihejirika", "Sow", "Conteh", "Achebe", "Obiora", "Fadahunsi"];

const cities = [
  "Ikoyi, Eti-Osa, Lagos State, Nigeria",
  "Victoria Island, Eti-Osa, Lagos State, Nigeria",
  "Lekki Phase 1, Eti-Osa, Lagos State, Nigeria",
  "Ajah, Eti-Osa, Lagos State, Nigeria",
  "Surulere, Surulere, Lagos State, Nigeria",
  "Yaba, Lagos Mainland, Lagos State, Nigeria",
  "Ikeja, Ikeja, Lagos State, Nigeria",
  "Gbagada, Lagos Mainland, Lagos State, Nigeria",
  "Magodo, Kosofe, Lagos State, Nigeria",
  "Ojodu, Ojodu, Lagos State, Nigeria",
  "Ago-Hausa, Ajeromi-Ifelodun, Lagos State, Nigeria",
  "Festac Town, Amuwo-Odofin, Lagos State, Nigeria",
  "Isale-Eko, Lagos Island, Lagos State, Nigeria",
  "Maitama, Abuja Municipal, FCT, Nigeria",
  "Wuse 2, Abuja Municipal, FCT, Nigeria",
  "Garki, Abuja Municipal, FCT, Nigeria",
  "GRA Phase 2, Port Harcourt, Rivers State, Nigeria",
  "Trans-Amadi, Port Harcourt, Rivers State, Nigeria",
  "Bodija, Ibadan North, Oyo State, Nigeria",
  "Enugu GRA, Enugu North, Enugu State, Nigeria",
];

const industries: Industry[] = ["PASTOR", "ENTREPRENEUR", "DOCTOR", "ENGINEER", "LAWYER", "EDUCATOR", "FINANCE", "TECH", "CREATIVE", "REAL_ESTATE", "HEALTHCARE", "MEDIA", "OTHER"];
const jobTitles: Record<Industry, string[]> = {
  PASTOR: ["Senior Pastor", "Associate Pastor", "Youth Pastor", "Worship Leader"],
  ENTREPRENEUR: ["Founder & CEO", "Co-Founder", "Managing Director", "Business Owner"],
  DOCTOR: ["Medical Doctor", "Consultant Physician", "Surgeon", "Pediatrician"],
  ENGINEER: ["Software Engineer", "Civil Engineer", "Mechanical Engineer", "Electrical Engineer"],
  LAWYER: ["Senior Advocate", "Corporate Lawyer", "Legal Counsel", "Barrister"],
  EDUCATOR: ["Professor", "Lecturer", "School Principal", "Academic Director"],
  FINANCE: ["CFO", "Investment Banker", "Financial Analyst", "Accountant"],
  TECH: ["CTO", "Product Manager", "Data Scientist", "DevOps Engineer"],
  CREATIVE: ["Creative Director", "Graphic Designer", "Art Director", "Photographer"],
  REAL_ESTATE: ["Property Developer", "Real Estate Agent", "Estate Manager", "Architect"],
  HEALTHCARE: ["Nurse Practitioner", "Pharmacist", "Public Health Officer", "Therapist"],
  MEDIA: ["Journalist", "TV Presenter", "Content Creator", "Media Executive"],
  OTHER: ["Consultant", "Project Manager", "Operations Lead", "Strategist"],
};
const companies = ["Stellar Horizon", "Grace & Co", "Lumina Studios", "Apex Ventures", "Kingdom Builders", "TechBridge Africa", "Covenant Group", "Pinnacle Health", "Zion Media", "Heritage Law", "Cornerstone Realty", "Elevate Finance", "Nexus Engineering", "Radiant Creative", "Providence Consulting"];

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
  "I can speak three languages fluently.",
  "I once cooked jollof rice for over 200 people at a community event.",
  "I've read the Bible cover to cover four times.",
  "I started my first business at age 16.",
  "I hold a black belt in taekwondo.",
  "I've visited 12 countries across 4 continents.",
  "I can solve a Rubik's cube in under two minutes.",
  "I once ran a half marathon with zero training.",
  "I taught myself to code during a 3-month sabbatical.",
  "I've been singing in a choir since I was 8 years old.",
  "I once met a sitting president at a conference.",
  "I bake sourdough bread every Sunday morning.",
  "I have a twin sibling who works in a completely different field.",
  "I wrote a children's book that was never published — yet.",
  "I can name every country in Africa from memory.",
];

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

    await prisma.profile.create({
      data: {
        name,
        phone: phone(),
        bio: pick(bios),
        funFact: pick(funFacts),
        city: pick(cities),
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
