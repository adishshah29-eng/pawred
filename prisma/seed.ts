// Mock data for development and live demos.
//
//   npm run db:seed        full reset: ~40 dogs, chats, likes, admin queues, 3 demo accounts
//   npm run demo:reset     quick reset: only the demo accounts' likes, matches and chats
//
// Safe to re-run. It only touches rows whose user id starts with "seed-" or "demo-".
// Sample owners have no password. Only the three demo accounts can sign in, using
// DEMO_PASSWORD from .env. Photos come from the free Dog CEO API (images.dog.ceo).
//
// Everything here is made-up demonstration data, including the health documents.

import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { PROMPTS } from "../src/lib/prompts";
import { DEMO_ACCOUNTS } from "../src/lib/demo-accounts";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const minsAgo = (m: number) => new Date(Date.now() - m * 60_000);
const daysAgo = (d: number) => minsAgo(d * 24 * 60);

// ---------- Owners ----------

type Owner = { id: string; name: string; city: string; banned?: string };

const owners: Owner[] = [
  { id: "seed-owner-1", name: "Ananya Rao", city: "Pune" },
  { id: "seed-owner-2", name: "Kabir Mehta", city: "Mumbai" },
  { id: "seed-owner-3", name: "Meera Iyer", city: "Bengaluru" },
  { id: "seed-owner-4", name: "Rohan Gill", city: "Delhi" },
  { id: "seed-owner-5", name: "Sana Qureshi", city: "Hyderabad" },
  { id: "seed-owner-6", name: "Arjun Nair", city: "Chennai" },
  { id: "seed-owner-7", name: "Ishita Bose", city: "Kolkata" },
  { id: "seed-owner-8", name: "Vikram Shah", city: "Ahmedabad" },
  { id: "seed-owner-9", name: "Neha Kapoor", city: "Jaipur" },
  { id: "seed-owner-10", name: "Dev Malhotra", city: "Chandigarh" },
  { id: "seed-owner-11", name: "Tanvi Joshi", city: "Pune" },
  { id: "seed-owner-12", name: "Farhan Ali", city: "Mumbai" },
  { id: "seed-owner-13", name: "Lakshmi Menon", city: "Bengaluru" },
  { id: "seed-owner-15", name: "Karan Dubey", city: "Ahmedabad", banned: "Aggressive messages to other owners" },
  { id: "seed-owner-16", name: "Simran Kaur", city: "Delhi" },
];

// ---------- Dogs ----------

// Prompt shortcuts: index into PROMPTS (src/lib/prompts.ts).
const IDEAL = 0, HUMAN = 1, FIND = 2, TRICK = 3, SUNDAY = 4, ALONG = 5, VET = 6, HEART = 7;
type PromptPair = [number, string];

type DogSpec = {
  key: string; // becomes the id: "seed-dog-<key>" (or "demo-dog-<key>")
  owner: string;
  name: string;
  breed: string; // slug used by the app (see src/lib/breeds.ts)
  sex: "MALE" | "FEMALE";
  months: number;
  p: [PromptPair, PromptPair, PromptPair];
  kg?: number;
  bio?: string;
  docs?: "verified" | "pending" | "rejected" | "pending-pedigree";
  paused?: boolean;
  photos?: string[]; // fixed photos; otherwise taken from Dog CEO
  vaccinated?: boolean;
};

const dogs: DogSpec[] = [
  // Golden Retrievers (Pune-heavy, so the demo has a full queue)
  { key: "cooper", owner: "demo-rohan", name: "Cooper", breed: "golden-retriever", sex: "MALE", months: 36, kg: 32, docs: "verified",
    bio: "Fetch champion, lake enthusiast, professional napper.",
    photos: ["https://images.dog.ceo/breeds/retriever-golden/n02099601_6099.jpg", "https://images.dog.ceo/breeds/retriever-golden/n02099601_4933.jpg"],
    p: [[IDEAL, "Patient, playful, and fine with sharing the tennis ball."], [HUMAN, "Hips and elbows scored A/A, eyes clear, vaccinations done every year."], [SUNDAY, "Early walk at Mulshi lake, then a very long nap in the sun."]] },
  { key: "luna", owner: "demo-priya", name: "Luna", breed: "golden-retriever", sex: "FEMALE", months: 28, kg: 27, docs: "verified",
    bio: "Gentle, sociable and very good with kids and other dogs.",
    photos: ["https://images.dog.ceo/breeds/retriever-golden/n02099601_3097.jpg", "https://images.dog.ceo/breeds/retriever-golden/n02099601_2422.jpg"],
    p: [[IDEAL, "Calm, kind, and happy to chase waves."], [TRICK, "Bringing back two balls at once."], [HUMAN, "Vaccinated, hips scored A/B, pedigree papers on file."]] },
  { key: "bruno", owner: "seed-owner-1", name: "Bruno", breed: "golden-retriever", sex: "MALE", months: 36, docs: "verified",
    p: [[IDEAL, "Calm around kids, happy in water, and fine with me carrying my own tennis ball."], [HUMAN, "Hips scored A/A, fully vaccinated, pedigree on file."], [SUNDAY, "Swimming at Khadakwasla, then a very long nap."]] },
  { key: "maya", owner: "seed-owner-2", name: "Maya", breed: "golden-retriever", sex: "FEMALE", months: 30, docs: "verified",
    p: [[FIND, "At the beach, making the same face as every golden ever."], [TRICK, "Opening doors with her nose."], [HUMAN, "Vaccinated, hips scored, very gentle with puppies."]] },
  { key: "honey", owner: "seed-owner-3", name: "Honey", breed: "golden-retriever", sex: "FEMALE", months: 26, docs: "pending-pedigree",
    p: [[IDEAL, "Patient. I take a while to warm up."], [FIND, "Under the dining table, waiting for something to drop."], [SUNDAY, "Cubbon Park at 7 a.m. before it gets crowded."]] },
  { key: "simba", owner: "seed-owner-11", name: "Simba", breed: "golden-retriever", sex: "MALE", months: 40, docs: "verified",
    p: [[IDEAL, "Someone who loves long walks and slow mornings."], [TRICK, "Waiting politely at the door. Mostly."], [HUMAN, "Fully vaccinated, hips A/A, calm temperament."]] },
  { key: "ranger", owner: "seed-owner-4", name: "Ranger", breed: "golden-retriever", sex: "MALE", months: 44, docs: "pending",
    p: [[FIND, "Retrieving everything: balls, sticks, slippers."], [ALONG, "Every dog, every human, every pigeon."], [HUMAN, "Vaccination card and hip scores uploaded, waiting for review."]] },
  { key: "sunny", owner: "seed-owner-12", name: "Sunny", breed: "golden-retriever", sex: "FEMALE", months: 33, docs: "verified",
    p: [[HEART, "Chicken biscuits and being called a good girl."], [SUNDAY, "Juhu beach at sunrise, then a nap in the car."], [HUMAN, "Vaccinated, hip and elbow scores A/A, loves children."]] },

  // Labradors
  { key: "rocky", owner: "seed-owner-3", name: "Rocky", breed: "labrador", sex: "MALE", months: 42, docs: "verified",
    p: [[IDEAL, "Food-motivated. Like me."], [HUMAN, "Hips and elbows scored, vaccinated, pedigree on file."], [FIND, "In any available puddle."]] },
  { key: "bella", owner: "seed-owner-6", name: "Bella", breed: "labrador", sex: "FEMALE", months: 32,
    p: [[TRICK, "Carrying the newspaper. Slightly damp."], [SUNDAY, "Swimming, fetch, swimming again."], [HUMAN, "Vaccinated, elbows scored, very calm."]] },
  { key: "chai", owner: "seed-owner-12", name: "Chai", breed: "labrador", sex: "MALE", months: 24, docs: "pending",
    p: [[FIND, "Stealing socks. Returning none."], [ALONG, "Anyone with treats."], [HUMAN, "Young but fully vaccinated. The card is with the admins."]] },
  { key: "mocha", owner: "seed-owner-9", name: "Mocha", breed: "labrador", sex: "FEMALE", months: 29, paused: true,
    p: [[FIND, "Sleeping on the cool floor."], [HEART, "Slow walks and long cuddles."], [HUMAN, "Taking a break from matching for a few weeks."]] },

  // Pugs
  { key: "momo", owner: "seed-owner-2", name: "Momo", breed: "pug", sex: "MALE", months: 28, docs: "verified",
    p: [[HUMAN, "Clear airway check, full vaccination record, and I snore."], [FIND, "In the one patch of sun in the flat."], [IDEAL, "Someone who also thinks walks should be short."]] },
  { key: "pickle", owner: "seed-owner-4", name: "Pickle", breed: "pug", sex: "FEMALE", months: 22,
    p: [[TRICK, "The sad eyes. Works every time."], [SUNDAY, "AC on, blanket on, humans home."], [HUMAN, "Vet-checked breathing, vaccinated, very cuddly."]] },

  // Beagles
  { key: "bagel", owner: "seed-owner-2", name: "Bagel", breed: "beagle", sex: "MALE", months: 29,
    p: [[FIND, "Following one very specific smell for three kilometres."], [HUMAN, "Vaccinated, eyes checked, I howl at the doorbell."], [IDEAL, "Curious and food-focused."]] },
  { key: "daisy", owner: "seed-owner-4", name: "Daisy", breed: "beagle", sex: "FEMALE", months: 23,
    p: [[TRICK, "Finding treats you hid last week."], [SUNDAY, "Sniff walk at Lodhi Garden."], [HUMAN, "Vaccinated, healthy weight, loves kids."]] },
  { key: "scout", owner: "seed-owner-10", name: "Scout", breed: "beagle", sex: "MALE", months: 31,
    p: [[FIND, "On the trail, nose down, ears flapping."], [ALONG, "Other beagles. Obviously."], [VET, "Fit, and a little too food-motivated."]] },

  // Shih Tzus
  { key: "coco", owner: "seed-owner-4", name: "Coco", breed: "shih-tzu", sex: "FEMALE", months: 36,
    p: [[SUNDAY, "A slow walk in Lodhi Garden and a nap on whoever sits first."], [HUMAN, "Knees and eyes checked, groomed every two weeks."], [IDEAL, "Small, calm, and not a barker."]] },
  { key: "teddy", owner: "seed-owner-1", name: "Teddy", breed: "shih-tzu", sex: "MALE", months: 30, docs: "rejected",
    p: [[FIND, "On the sofa. The good cushion."], [TRICK, "Spinning in circles for a biscuit."], [HUMAN, "Vaccinated, eyes checked, loves baths (really)."]] },
  { key: "peanut", owner: "seed-owner-13", name: "Peanut", breed: "shih-tzu", sex: "FEMALE", months: 26,
    p: [[HEART, "Gentle brushing and cheese."], [FIND, "Wherever the warm laundry is."], [HUMAN, "Vaccinated, kneecaps checked."]] },

  // Border Collies
  { key: "biscuit", owner: "seed-owner-10", name: "Biscuit", breed: "border-collie", sex: "FEMALE", months: 24, docs: "verified",
    p: [[TRICK, "Herding my humans to the door at exactly 6 a.m."], [IDEAL, "Can keep up. Literally."], [HUMAN, "CEA eye test clear, hips scored."]] },
  { key: "ziggy", owner: "seed-owner-6", name: "Ziggy", breed: "border-collie", sex: "MALE", months: 40,
    p: [[FIND, "Staring at a frisbee until someone throws it."], [SUNDAY, "Agility class, then the beach."], [HUMAN, "Eye test clear, very vocal."]] },

  // Huskies
  { key: "storm", owner: "seed-owner-1", name: "Storm", breed: "husky", sex: "MALE", months: 38,
    p: [[FIND, "Lying on the cold bathroom tiles."], [HUMAN, "Eyes and hips checked, AC is non-negotiable."], [IDEAL, "Can handle a lot of talking back."]] },
  { key: "nova", owner: "seed-owner-3", name: "Nova", breed: "husky", sex: "FEMALE", months: 28, docs: "verified",
    p: [[TRICK, "Singing along to the pressure cooker."], [SUNDAY, "Early run, then a frozen treat."], [HUMAN, "Vaccinated, eye test clear."]] },
  { key: "kodi", owner: "seed-owner-16", name: "Kodi", breed: "husky", sex: "MALE", months: 34, vaccinated: false,
    p: [[FIND, "Plotting an escape. Every day."], [ALONG, "Anyone with a fence taller than six feet."], [VET, "Fluffy, healthy and slightly dramatic."]] },

  // Corgis
  { key: "waffles", owner: "seed-owner-4", name: "Waffles", breed: "corgi", sex: "MALE", months: 27,
    p: [[FIND, "Herding the cat. The cat does not agree."], [HUMAN, "Spine and hips checked, vaccinated."], [IDEAL, "Short legs, big opinions."]] },
  { key: "mochi", owner: "seed-owner-3", name: "Mochi", breed: "corgi", sex: "FEMALE", months: 25,
    p: [[TRICK, "The sploot."], [SUNDAY, "A café with dog-friendly seating in Indiranagar."], [HUMAN, "Vaccinated, hips scored, excellent manners."]] },

  // Weimaraners
  { key: "ghost", owner: "seed-owner-3", name: "Ghost", breed: "weimaraner", sex: "MALE", months: 48, docs: "verified",
    p: [[FIND, "Standing very still by the kitchen door, not waiting for dinner."], [HUMAN, "Hips scored, vaccinated, needs a big run daily."], [IDEAL, "Athletic and not scared of thunder."]] },
  { key: "willow", owner: "seed-owner-6", name: "Willow", breed: "weimaraner", sex: "FEMALE", months: 34,
    p: [[TRICK, "Opening the fridge. Please don't tell."], [SUNDAY, "A long run on Marina beach, then a sunbeam."], [HUMAN, "Vaccinated, hip score pending."]] },

  // German Shepherds
  { key: "rex", owner: "seed-owner-8", name: "Rex", breed: "german-shepherd", sex: "MALE", months: 41, docs: "verified",
    p: [[FIND, "On guard duty. Mostly at the window."], [HUMAN, "Hips and elbows scored, DM test clear, trained to Level 2."], [IDEAL, "Smart, steady, and not distracted by squirrels."]] },
  { key: "zara", owner: "seed-owner-9", name: "Zara", breed: "german-shepherd", sex: "FEMALE", months: 30, docs: "pending",
    p: [[TRICK, "Finding the TV remote on command."], [SUNDAY, "Training in the morning, a long nap in the afternoon."], [HUMAN, "Vaccinated. My documents are with the admins."]] },

  // Rottweilers
  { key: "tyson", owner: "seed-owner-15", name: "Tyson", breed: "rottweiler", sex: "MALE", months: 36,
    p: [[FIND, "Guarding the sofa."], [HUMAN, "Vaccinated, hips scored."], [IDEAL, "A confident, calm partner."]] },
  { key: "roxy", owner: "seed-owner-10", name: "Roxy", breed: "rottweiler", sex: "FEMALE", months: 28,
    p: [[FIND, "Leaning on people. All of my weight."], [HUMAN, "Hips and elbows scored, heart checked, vaccinated."], [SUNDAY, "A big bone and a bigger sofa."]] },

  // Dachshunds
  { key: "frankie", owner: "seed-owner-7", name: "Frankie", breed: "dachshund", sex: "MALE", months: 26,
    p: [[FIND, "Digging in the plant pot. Again."], [HUMAN, "Spine checked, vaccinated, microchipped."], [IDEAL, "Long, low and loyal."]] },
  { key: "olive", owner: "seed-owner-9", name: "Olive", breed: "dachshund", sex: "FEMALE", months: 30,
    p: [[TRICK, "Burrowing under every blanket."], [SUNDAY, "Winter sun and a warm lap."], [HUMAN, "Vaccinated, back checked by the vet."]] },

  // Dobermans
  { key: "duke", owner: "seed-owner-5", name: "Duke", breed: "doberman", sex: "MALE", months: 38,
    p: [[FIND, "Standing very upright and looking important."], [HUMAN, "Heart and thyroid checked, vaccinated."], [ALONG, "Calm, confident dogs."]] },
  { key: "athena", owner: "seed-owner-16", name: "Athena", breed: "doberman", sex: "FEMALE", months: 31, docs: "verified",
    p: [[TRICK, "Sitting like a statue until the treat arrives."], [SUNDAY, "A long run, a longer nap."], [HUMAN, "Heart screen clear, vaccinated, pedigree on file."]] },

  // Pomeranians
  { key: "pumpkin", owner: "seed-owner-13", name: "Pumpkin", breed: "pomeranian", sex: "FEMALE", months: 24,
    p: [[HEART, "Being carried everywhere."], [FIND, "On the highest cushion in the house."], [HUMAN, "Vaccinated, kneecaps checked."]] },
  { key: "oreo", owner: "seed-owner-16", name: "Oreo", breed: "pomeranian", sex: "MALE", months: 27,
    p: [[TRICK, "Barking at things twenty times my size."], [SUNDAY, "A short walk and a long cuddle."], [HUMAN, "Vaccinated, dental done."]] },

  // French Bulldogs
  { key: "bruce", owner: "seed-owner-11", name: "Bruce", breed: "french-bulldog", sex: "MALE", months: 30,
    p: [[FIND, "Snoring. Loudly. Anywhere."], [HUMAN, "Airway check done, vaccinated, spine checked."], [IDEAL, "Someone who loves a short walk."]] },
  { key: "pearl", owner: "seed-owner-9", name: "Pearl", breed: "french-bulldog", sex: "FEMALE", months: 27,
    p: [[TRICK, "Rolling over for belly rubs."], [SUNDAY, "An air-conditioned room and a soft blanket."], [HUMAN, "Vaccinated, airway assessed."]] },
];

// Dogs whose owners switched on "open to other breeds". The two demo dogs are among them,
// so their Discover feed and grid show dogs of many breeds, not only Golden Retrievers.
const OPEN_TO_MIXED = new Set([
  "cooper", "luna", "rocky", "chai", "momo", "pickle", "bagel", "daisy", "scout", "coco", "teddy", "peanut", "biscuit", "ziggy",
  "storm", "nova", "kodi", "waffles", "mochi", "ghost", "willow", "rex", "zara", "roxy", "frankie", "olive", "duke", "athena",
  "pumpkin", "oreo", "bruce", "pearl", "bella",
]);

// Dog CEO paths for each breed slug.
const BREED_PATH: Record<string, string> = {
  "golden-retriever": "retriever/golden", labrador: "labrador", pug: "pug", beagle: "beagle", "shih-tzu": "shihtzu",
  "border-collie": "collie/border", husky: "husky", corgi: "pembroke", weimaraner: "weimaraner",
  "german-shepherd": "german/shepherd", rottweiler: "rottweiler", dachshund: "dachshund", doberman: "doberman",
  pomeranian: "pomeranian", "french-bulldog": "bulldog/french",
};

const dogId = (d: DogSpec) => (d.owner.startsWith("demo-") ? `demo-dog-${d.key}` : `seed-dog-${d.key}`);
const dogs_by_key = new Map(dogs.map((d) => [d.key, d]));
const idOf = (key: string) => dogId(dogs_by_key.get(key)!);
const ownerOf = (key: string) => dogs_by_key.get(key)!.owner;

// ---------- Interactions ----------

type Chat = [side: "a" | "b", text: string, minutesAgo: number][];

type MatchSpec = { a: string; b: string; daysAgo: number; chat: Chat; unreadLast?: number };

const matches: MatchSpec[] = [
  { a: "bruno", b: "maya", daysAgo: 12, chat: [
    ["b", "Hi! Bruno's swimming answer sold us. Where does he usually swim?", 17000],
    ["a", "Khadakwasla most Sundays. Happy to share his hip scores first.", 16990],
    ["b", "Perfect, Maya's are on her profile too. Coffee walk this weekend?", 16980],
  ] },
  { a: "simba", b: "luna", daysAgo: 3, unreadLast: 2, chat: [
    ["b", "Hi! Simba's lake-walk answer made me smile. Luna's the same.", 4300],
    ["a", "Thank you! Luna's hips are A/B, right? Simba's are A/A.", 4290],
    ["b", "Yes, A/B on both. Vaccinations are current and I can share the card.", 4280],
    ["a", "Perfect. I'd like our vets to talk before we meet.", 1400],
    ["b", "Agreed. My vet is in Baner and happy to share her number.", 1380],
    ["a", "Great. Are you free to meet at the Aundh dog park this Saturday?", 50],
    ["a", "No pressure at all, we can go at your pace.", 48],
  ] },
  { a: "cooper", b: "sunny", daysAgo: 2, unreadLast: 1, chat: [
    ["a", "Hi! Sunny's beach photo is lovely. How old is she?", 2900],
    ["b", "Thanks! She's 33 months. Cooper looks very happy in his lake photo.", 2880],
    ["a", "He is. We're in Pune and you're in Mumbai, right?", 2870],
    ["b", "Yes. Happy to travel if everything lines up with the vets.", 2860],
    ["b", "Sunny's hip and elbow scores are both A. I'll send the PDF tonight.", 95],
  ] },
  { a: "rocky", b: "bella", daysAgo: 6, chat: [
    ["a", "Hi! Rocky's EIC test came back clear. Is Bella tested?", 8600],
    ["b", "Yes, she's clear too. I'll send the report.", 8590],
    ["a", "Wonderful. Where do you usually walk her?", 8580],
    ["b", "Marina beach, early mornings. Maybe we meet there?", 8570],
  ] },
  { a: "momo", b: "pickle", daysAgo: 4, chat: [
    ["a", "Hello! Momo's airway check was clear last month.", 5700],
    ["b", "Pickle's too. Let's compare notes with our vets.", 5600],
  ] },
  { a: "ghost", b: "willow", daysAgo: 8, chat: [
    ["a", "Hi! Ghost needs a long run every day. Is Willow the same?", 11300],
    ["b", "Absolutely, 10 km most days.", 11290],
    ["a", "A match made in heaven then.", 11280],
  ] },
  { a: "rex", b: "zara", daysAgo: 1, chat: [
    ["a", "Hi Neha, Rex's DM test is clear and his hips are A/A.", 1500],
    ["b", "Great! Zara's documents are with the admins. I'll share once they're verified.", 1480],
  ] },
];

type LikeSpec = { from: string; to: string; target: "PHOTO" | "PROMPT"; n: number; comment?: string; daysAgo: number };

// One-way likes waiting in "Likes you".
const pendingLikes: LikeSpec[] = [
  { from: "honey", to: "cooper", target: "PROMPT", n: 0, daysAgo: 1, comment: "Honey needs a patient partner too. She'd love the lake." },
  { from: "daisy", to: "bagel", target: "PHOTO", n: 0, daysAgo: 2, comment: "Daisy found that hidden treat too." },
  { from: "nova", to: "storm", target: "PROMPT", n: 1, daysAgo: 3, comment: "Nova insists on AC as well." },
  { from: "peanut", to: "teddy", target: "PHOTO", n: 0, daysAgo: 1, comment: "Peanut approves of sofa cushions." },
  { from: "athena", to: "duke", target: "PROMPT", n: 0, daysAgo: 2 },
];

const passes: [string, string][] = [["duke", "athena"]];

const reports = [
  { id: "seed-report-1", reporter: "seed-owner-2", dog: "duke", reason: "Selling puppies / commercial breeding: His bio mentions a price per puppy.", status: "OPEN" as const, daysAgo: 1 },
  { id: "seed-report-2", reporter: "seed-owner-11", dog: "ranger", reason: "Health information looks false: The hip score on his profile doesn't match what the owner told me.", status: "OPEN" as const, daysAgo: 0 },
  { id: "seed-report-3", reporter: "seed-owner-4", dog: "tyson", reason: "Rude or unsafe messages", status: "RESOLVED" as const, daysAgo: 9 },
  { id: "seed-report-4", reporter: "seed-owner-6", dog: "waffles", reason: "Something else: Photos look borrowed from another site.", status: "DISMISSED" as const, daysAgo: 7 },
];

const MATCH_LIKE_COMMENTS = ["Loved this one!", "That made us smile.", "Exactly what we're looking for.", "Same here!"];

// ---------- Photos ----------

async function breedPhotos(slug: string, count: number): Promise<string[]> {
  const path = BREED_PATH[slug];
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(1300); // Dog CEO rate-limits quick bursts
    try {
      const res = await fetch(`https://dog.ceo/api/breed/${path}/images/random/${Math.min(50, count)}`);
      if (res.ok) {
        const json = (await res.json()) as { status: string; message: string[] };
        if (json.status === "success" && json.message.length > 0) return json.message;
      }
    } catch {
      // try again
    }
  }
  throw new Error(`Could not fetch photos for ${slug} from dog.ceo. Check your internet connection and run again.`);
}

// ---------- Build and write ----------

const isDemoDog = (key: string) => dogs_by_key.get(key)!.owner.startsWith("demo-");

async function createPeople(demoPassword: string) {
  console.log("Creating owners and demo accounts…");
  const hash = await hashPassword(demoPassword);

  const users: Prisma.UserCreateManyInput[] = [
    ...owners.map((o, i) => ({
      id: o.id, name: o.name, email: `${o.name.toLowerCase().replace(/[^a-z]+/g, ".")}@seed.pawred.dev`,
      emailVerified: true, city: o.city, createdAt: daysAgo(34 - i), banned: Boolean(o.banned), banReason: o.banned ?? null,
    })),
    ...DEMO_ACCOUNTS.map((d, i) => ({
      id: d.id, name: d.name, email: d.email, emailVerified: true, role: d.role, city: d.city ?? null,
      createdAt: daysAgo(d.role === "admin" ? 40 : 1 + i * 0.2),
    })),
  ];
  await prisma.user.createMany({ data: users });
  await prisma.account.createMany({
    data: DEMO_ACCOUNTS.map((d) => ({ id: `acc-${d.id}`, accountId: d.id, providerId: "credential", userId: d.id, password: hash })),
  });

  console.log(`Fetching photos for ${Object.keys(BREED_PATH).length} breeds…`);
  const pool = new Map<string, string[]>();
  for (const slug of Object.keys(BREED_PATH)) {
    const n = dogs.filter((d) => d.breed === slug).length;
    pool.set(slug, await breedPhotos(slug, n * 3 + 2));
  }
  const taken = new Map<string, number>();
  const nextPhoto = (slug: string) => {
    const list = pool.get(slug)!;
    const i = taken.get(slug) ?? 0;
    taken.set(slug, i + 1);
    return list[i % list.length];
  };

  const ownerById = new Map<string, { city: string }>([...owners, ...DEMO_ACCOUNTS.map((d) => ({ id: d.id, city: d.city ?? "Pune" }))].map((o) => [o.id, o]));

  console.log(`Creating ${dogs.length} dogs with photos, prompts and health documents…`);
  const dogRows: Prisma.DogCreateManyInput[] = [];
  const photoRows: Prisma.DogPhotoCreateManyInput[] = [];
  const promptRows: Prisma.PromptAnswerCreateManyInput[] = [];
  const docRows: Prisma.HealthDocCreateManyInput[] = [];

  dogs.forEach((d, i) => {
    const id = dogId(d);
    const demo = isDemoDog(d.key);
    const status = d.docs === "verified" ? "VERIFIED" : d.docs === "rejected" ? "REJECTED" : d.docs ? "PENDING" : "NONE";
    dogRows.push({
      id, ownerId: d.owner, name: d.name, breed: d.breed, sex: d.sex,
      dateOfBirth: daysAgo(d.months * 30.4), weightKg: d.kg ?? null, bio: d.bio ?? null,
      city: ownerById.get(d.owner)!.city, vaccinated: d.vaccinated ?? true, isActive: !d.paused, openToMixed: OPEN_TO_MIXED.has(d.key),
      verificationStatus: status,
      // Demo dogs are newest, so Cooper is first in Luna's Discover queue.
      createdAt: demo ? minsAgo(d.key === "cooper" ? 5 : 12) : daysAgo(3 + ((i * 7) % 25)),
    });

    const urls = d.photos ?? Array.from({ length: 2 + (i % 2) }, () => nextPhoto(d.breed));
    urls.forEach((url, order) => photoRows.push({ id: `${id}-ph${order}`, dogId: id, url, alt: `${d.name}, ${d.breed.replace(/-/g, " ")}, photo ${order + 1}`, order }));
    d.p.forEach(([promptIdx, answer], order) => promptRows.push({ id: `${id}-p${order}`, dogId: id, prompt: PROMPTS[promptIdx], answer, order }));

    const doc = (type: Prisma.HealthDocCreateManyInput["type"], file: string, st: "PENDING" | "APPROVED" | "REJECTED", n: number): Prisma.HealthDocCreateManyInput => ({
      id: `${id}-doc-${n}`, dogId: id, type, fileUrl: `/sample-docs/${file}.svg`, status: st,
      reviewedById: st === "PENDING" ? null : "demo-admin", reviewedAt: st === "PENDING" ? null : daysAgo(5 + (i % 6)),
      note: st === "REJECTED" ? "Genetic report is for a different dog. Please upload the right one." : null,
      createdAt: daysAgo(6 + (i % 7)),
    });
    if (d.docs === "verified") docRows.push(doc("VACCINATION", "vaccination-card", "APPROVED", 0), doc("HIP_ELBOW", "hip-elbow-score", "APPROVED", 1));
    if (d.docs === "pending") docRows.push(doc("VACCINATION", "vaccination-card", "PENDING", 0), doc("HIP_ELBOW", "hip-elbow-score", "PENDING", 1));
    if (d.docs === "pending-pedigree") docRows.push(doc("PEDIGREE", "pedigree", "PENDING", 0));
    if (d.docs === "rejected") docRows.push(doc("GENETIC", "genetic-test", "REJECTED", 0));
  });

  await prisma.dog.createMany({ data: dogRows });
  await prisma.dogPhoto.createMany({ data: photoRows });
  await prisma.promptAnswer.createMany({ data: promptRows });
  await prisma.healthDoc.createMany({ data: docRows });

  console.log("Creating reports…");
  await prisma.report.createMany({
    data: reports.map((r) => ({
      id: r.id, reporterId: r.reporter, dogId: idOf(r.dog), reason: r.reason, status: r.status,
      createdAt: daysAgo(r.daysAgo), resolvedAt: r.status === "OPEN" ? null : daysAgo(Math.max(0, r.daysAgo - 1)),
    })),
  });
}

// Likes, matches, chats, notifications and the activity feed. With `demoOnly`,
// only the parts that touch a demo dog are (re)created.
async function createRelations(demoOnly: boolean) {
  const touchesDemo = (...keys: string[]) => keys.some(isDemoDog);
  const keep = (...keys: string[]) => !demoOnly || touchesDemo(...keys);

  const likeRows: Prisma.LikeCreateManyInput[] = [];
  const matchRows: Prisma.MatchCreateManyInput[] = [];
  const messageRows: Prisma.MessageCreateManyInput[] = [];
  const notifRows: Prisma.NotificationCreateManyInput[] = [];
  const logRows: Prisma.ActivityLogCreateManyInput[] = [];

  const target = (key: string, kind: "PHOTO" | "PROMPT", n: number) => `${idOf(key)}-${kind === "PHOTO" ? "ph" : "p"}${n}`;
  const log = (userId: string, action: Prisma.ActivityLogCreateManyInput["action"], meta: object, at: Date) => logRows.push({ userId, action, meta, createdAt: at });

  matches.filter((m) => keep(m.a, m.b)).forEach((m, i) => {
    const a = idOf(m.a), b = idOf(m.b);
    const [dogAId, dogBId] = a < b ? [a, b] : [b, a];
    const matchId = `seed-match-${m.a}-${m.b}`;
    const at = daysAgo(m.daysAgo);
    matchRows.push({ id: matchId, dogAId, dogBId, createdAt: at });

    // Both sides liked each other, which is what made the match.
    likeRows.push(
      { id: `${matchId}-l1`, fromDogId: a, toDogId: b, targetType: "PROMPT", targetId: target(m.b, "PROMPT", 0), comment: MATCH_LIKE_COMMENTS[i % 4], createdAt: new Date(+at - 3600_000) },
      { id: `${matchId}-l2`, fromDogId: b, toDogId: a, targetType: "PHOTO", targetId: target(m.a, "PHOTO", 0), comment: MATCH_LIKE_COMMENTS[(i + 1) % 4], createdAt: at },
    );
    log(ownerOf(m.a), "LIKE_SENT", { fromDogId: a, toDogId: b }, new Date(+at - 3600_000));
    log(ownerOf(m.b), "LIKE_SENT", { fromDogId: b, toDogId: a }, at);
    log(ownerOf(m.b), "MATCH_CREATED", { matchId }, at);
    notifRows.push(
      { userId: ownerOf(m.a), type: "NEW_MATCH", payload: { matchId, withDogName: dogs_by_key.get(m.b)!.name }, seen: true, createdAt: at },
      { userId: ownerOf(m.b), type: "NEW_MATCH", payload: { matchId, withDogName: dogs_by_key.get(m.a)!.name }, seen: true, createdAt: at },
    );

    m.chat.forEach(([side, text, mins], j) => {
      const unread = m.unreadLast && j >= m.chat.length - m.unreadLast;
      messageRows.push({
        id: `${matchId}-m${j}`, matchId, senderDogId: side === "a" ? a : b, text,
        createdAt: minsAgo(mins), readAt: unread ? null : minsAgo(Math.max(1, mins - 3)),
      });
    });
    if (m.unreadLast) {
      const last = m.chat[m.chat.length - 1];
      notifRows.push({ userId: ownerOf(last[0] === "a" ? m.b : m.a), type: "NEW_MESSAGE", payload: { matchId, fromDogName: dogs_by_key.get(last[0] === "a" ? m.a : m.b)!.name }, seen: false, createdAt: minsAgo(last[2]) });
    }
  });

  pendingLikes.filter((l) => keep(l.from, l.to)).forEach((l, i) => {
    const at = daysAgo(l.daysAgo);
    likeRows.push({ id: `seed-like-${l.from}-${l.to}`, fromDogId: idOf(l.from), toDogId: idOf(l.to), targetType: l.target, targetId: target(l.to, l.target, l.n), comment: l.comment ?? null, createdAt: at });
    log(ownerOf(l.from), "LIKE_SENT", { fromDogId: idOf(l.from), toDogId: idOf(l.to) }, at);
    notifRows.push({ userId: ownerOf(l.to), type: "NEW_LIKE", payload: { fromDogId: idOf(l.from), fromDogName: dogs_by_key.get(l.from)!.name }, seen: i % 2 === 0, createdAt: at });
  });

  const passRows = passes.filter(([f, t]) => keep(f, t)).map(([f, t]) => ({ fromDogId: idOf(f), toDogId: idOf(t), createdAt: daysAgo(2) }));
  passRows.forEach((p) => log(dogs.find((d) => dogId(d) === p.fromDogId)!.owner, "PASS", { fromDogId: p.fromDogId, toDogId: p.toDogId }, p.createdAt));

  if (!demoOnly) {
    // Account history: sign-ups, new dogs, uploaded and reviewed documents, reports.
    owners.forEach((o, i) => log(o.id, "SIGN_UP", {}, daysAgo(34 - i)));
    DEMO_ACCOUNTS.filter((d) => d.role === "user").forEach((d) => log(d.id, "SIGN_UP", {}, daysAgo(1)));
    dogs.forEach((d, i) => {
      log(d.owner, "DOG_CREATED", { dogId: dogId(d) }, daysAgo(3 + ((i * 7) % 25)));
      if (d.docs) log(d.owner, "DOC_UPLOADED", { dogId: dogId(d) }, daysAgo(6 + (i % 7)));
      if (d.docs === "verified" || d.docs === "rejected") log("demo-admin", "DOC_REVIEWED", { dogId: dogId(d), decision: d.docs === "verified" ? "approve" : "reject" }, daysAgo(5 + (i % 6)));
      if (d.docs === "verified") notifRows.push({ userId: d.owner, type: "DOC_APPROVED", payload: { dogId: dogId(d), dogName: d.name }, seen: true, createdAt: daysAgo(5 + (i % 6)) });
    });
    reports.forEach((r) => log(r.reporter, "REPORT_FILED", { dogId: idOf(r.dog) }, daysAgo(r.daysAgo)));
    log("demo-admin", "REPORT_HANDLED", { reportId: "seed-report-3", outcome: "resolve" }, daysAgo(8));
    log("demo-admin", "USER_BANNED", { userId: "seed-owner-15" }, daysAgo(8));
  }

  // On a quick reset, only the demo accounts' own notifications and history are rewritten.
  const mine = <T extends { userId: string }>(rows: T[]) => (demoOnly ? rows.filter((r) => r.userId.startsWith("demo-")) : rows);
  const notifications = mine(notifRows);
  const activity = mine(logRows);

  await prisma.match.createMany({ data: matchRows });
  await prisma.like.createMany({ data: likeRows });
  await prisma.pass.createMany({ data: passRows });
  await prisma.message.createMany({ data: messageRows });
  await prisma.notification.createMany({ data: notifications });
  await prisma.activityLog.createMany({ data: activity });
  console.log(`Created ${matchRows.length} matches, ${messageRows.length} messages, ${likeRows.length} likes, ${notifications.length} notifications, ${activity.length} activity entries.`);
}

async function clearAll() {
  console.log("Clearing earlier mock data…");
  // Deleting these users cascades to their dogs, photos, prompts, documents, likes, matches, chats, reports and logs.
  await prisma.user.deleteMany({ where: { OR: [{ id: { startsWith: "seed-" } }, { id: { startsWith: "demo-" } }] } });
}

async function clearDemoRelations() {
  console.log("Resetting the demo accounts' likes, matches and chats…");
  const demoDogs = dogs.filter((d) => d.owner.startsWith("demo-")).map(dogId);
  const demoUsers = DEMO_ACCOUNTS.map((d) => d.id);
  // Matches the demo dogs are in (cascades to their messages), plus any like or pass either way.
  await prisma.match.deleteMany({ where: { OR: [{ dogAId: { in: demoDogs } }, { dogBId: { in: demoDogs } }] } });
  await prisma.like.deleteMany({ where: { OR: [{ fromDogId: { in: demoDogs } }, { toDogId: { in: demoDogs } }] } });
  await prisma.pass.deleteMany({ where: { OR: [{ fromDogId: { in: demoDogs } }, { toDogId: { in: demoDogs } }] } });
  await prisma.notification.deleteMany({ where: { userId: { in: demoUsers }, type: { in: ["NEW_LIKE", "NEW_MATCH", "NEW_MESSAGE"] } } });
  await prisma.activityLog.deleteMany({ where: { userId: { in: demoUsers }, action: { in: ["LIKE_SENT", "MATCH_CREATED", "PASS"] } } });
}

async function main() {
  const demoOnly = process.argv.includes("--demo-only");
  const demoPassword = process.env.DEMO_PASSWORD;
  if (!demoOnly && !demoPassword) throw new Error("Set DEMO_PASSWORD in .env first. It is the shared password for the three demo accounts.");

  if (demoOnly) {
    await clearDemoRelations();
  } else {
    await clearAll();
    await createPeople(demoPassword!);
  }
  await createRelations(demoOnly);
  console.log(demoOnly ? "Demo reset complete." : "Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
