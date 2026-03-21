import { PrismaClient, Industry } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const firstNames = ["James", "Amara", "David", "Sarah", "Chidi", "Grace", "Emmanuel", "Fatima", "Daniel", "Blessing", "Michael", "Ngozi", "Samuel", "Adaeze", "Joshua", "Chioma", "Elijah", "Miriam", "Isaac", "Deborah", "Aaron", "Esther", "Caleb", "Ruth", "Nathan", "Priscilla", "Solomon", "Abigail", "Gideon", "Lydia"];
const lastNames = ["Okafor", "Chen", "Williams", "Jenkins", "Adeyemi", "Mensah", "Osei", "Nwosu", "Afolabi", "Diallo", "Owusu", "Balogun", "Eze", "Asante", "Musa", "Dike", "Onyeka", "Kamara", "Banda", "Okeke", "Traoré", "Abubakar", "Nkrumah", "Olawale", "Ihejirika", "Sow", "Conteh", "Achebe", "Obiora", "Fadahunsi"];
const cities = ["Lagos, Nigeria", "Abuja, Nigeria", "Port Harcourt, Nigeria", "Ibadan, Nigeria", "Kano, Nigeria", "Enugu, Nigeria", "Accra, Ghana", "Nairobi, Kenya", "London, UK", "Houston, TX", "Atlanta, GA", "Toronto, Canada"];
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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function phone(): string {
  return `+234 ${Math.floor(700 + Math.random() * 100)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`;
}

async function main() {
  console.log("Seeding 50 profiles...");

  // Clear existing seed data
  await prisma.profile.deleteMany({
    where: { sessionKey: { startsWith: "seed-" } },
  });

  for (let i = 0; i < 50; i++) {
    const name = `${pick(firstNames)} ${pick(lastNames)}`;
    const industry = pick(industries);
    const jobTitle = pick(jobTitles[industry]);
    const company = pick(companies);
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "");

    await prisma.profile.create({
      data: {
        name,
        phone: phone(),
        bio: pick(bios),
        city: pick(cities),
        jobTitle,
        company,
        industry,
        contactLink: `https://linkedin.com/in/${slug}-${i}`,
        sessionKey: `seed-${i}-${Date.now()}`,
      },
    });
  }

  console.log("Done — 50 profiles created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
