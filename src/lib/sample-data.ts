// Sample content for the marketing pages. Photos are from Unsplash (free licence).
// Replace with real profiles from the database once Phase 5 is built.

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const photos = {
  bruno: unsplash("1558788353-f76d92427f16"), // golden retriever portrait
  goldenPair: unsplash("1515870672913-a4c298575776"), // two golden retrievers
  ghost: unsplash("1566710582818-d673dc761201"), // weimaraner
  biscuit: unsplash("1783936093098-2daf9e8ef72e"), // border collie
  momo: unsplash("1518020382113-a7e8fc38eac9"), // pug
  coco: unsplash("1629740067905-bd3f515aa739"), // shih tzu
  corgis: unsplash("1761959940349-a3280b45aa7c"), // two corgis
  rugPair: unsplash("1504595403659-9088ce801e29"), // two dogs on a rug
};

export type SampleDog = {
  name: string;
  breed: string;
  sex: "Male" | "Female";
  age: string;
  city: string;
  photo: string;
  photoAlt: string;
  prompt: string;
  answer: string;
};

export const bruno: SampleDog & { distance: string; health: string[] } = {
  name: "Bruno",
  breed: "Golden Retriever",
  sex: "Male",
  age: "3 yrs",
  city: "Pune",
  distance: "4 km away",
  photo: photos.bruno,
  photoAlt: "Golden retriever looking at the camera with his mouth open",
  prompt: "My ideal partner is…",
  answer:
    "Calm around kids, happy in water, and doesn't mind that I carry my own tennis ball everywhere.",
  health: ["Vaccinated", "Hips scored", "Pedigree on file"],
};

export const sampleDogs: SampleDog[] = [
  {
    name: "Ghost",
    breed: "Weimaraner",
    sex: "Male",
    age: "4 yrs",
    city: "Bengaluru",
    photo: photos.ghost,
    photoAlt: "Grey weimaraner sitting against a pale wall",
    prompt: "You'll find me…",
    answer: "Standing very still by the kitchen door, pretending I'm not waiting for dinner.",
  },
  {
    name: "Biscuit",
    breed: "Border Collie",
    sex: "Female",
    age: "2 yrs",
    city: "Shimla",
    photo: photos.biscuit,
    photoAlt: "Border collie holding wildflowers in her mouth on a mountain meadow",
    prompt: "Best trick I know…",
    answer: "Herding my humans to the door at exactly 6 a.m. Every day. No exceptions.",
  },
  {
    name: "Momo",
    breed: "Pug",
    sex: "Male",
    age: "2 yrs",
    city: "Mumbai",
    photo: photos.momo,
    photoAlt: "Black pug wearing a denim jacket collar",
    prompt: "My human will want to know…",
    answer: "Full vaccination record, clear airway check, and I snore. Loudly.",
  },
  {
    name: "Coco",
    breed: "Shih Tzu",
    sex: "Female",
    age: "3 yrs",
    city: "Delhi",
    photo: photos.coco,
    photoAlt: "Small shih tzu standing on a green blanket",
    prompt: "A perfect Sunday is…",
    answer: "A slow walk in Lodhi Garden and a long nap on whoever sits down first.",
  },
];

export type Breed = {
  slug: string;
  name: string;
  photo: string;
  photoAlt: string;
  blurb: string;
};

export const breeds: Breed[] = [
  {
    slug: "golden-retriever",
    name: "Golden Retriever",
    photo: photos.goldenPair,
    photoAlt: "Two golden retrievers lying side by side",
    blurb: "Gentle family dogs. Ask for hip and elbow scores before you match.",
  },
  {
    slug: "pug",
    name: "Pug",
    photo: photos.momo,
    photoAlt: "Black pug wearing a denim jacket collar",
    blurb: "Big personality, short snout. An airway check matters more than looks.",
  },
  {
    slug: "border-collie",
    name: "Border Collie",
    photo: photos.biscuit,
    photoAlt: "Border collie on a mountain meadow",
    blurb: "Clever and busy. Eye tests (CEA) are the standard check.",
  },
  {
    slug: "shih-tzu",
    name: "Shih Tzu",
    photo: photos.coco,
    photoAlt: "Small shih tzu on a green blanket",
    blurb: "Apartment-friendly companions. Look for clear eye and knee checks.",
  },
  {
    slug: "weimaraner",
    name: "Weimaraner",
    photo: photos.ghost,
    photoAlt: "Grey weimaraner sitting against a pale wall",
    blurb: "Athletic and loyal. Hip scoring is a must.",
  },
  {
    slug: "corgi",
    name: "Corgi",
    photo: photos.corgis,
    photoAlt: "Two corgis sitting together on a stone wall",
    blurb: "Short legs, long backs. Check for spine and hip history.",
  },
];
