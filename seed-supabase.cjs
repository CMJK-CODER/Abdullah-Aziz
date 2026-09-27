// Push existing and rich dummy testing data to Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://blkqwipoprumtejpluwj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rQUs58TAbKAP5SDtGrJH3g_9Ksg1cui';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function uuid(prefix, num) {
  // Deterministic valid hex UUID generation
  const hexNum = num.toString(16).padStart(12, '0');
  const cleanPrefix = prefix.replace(/[^0-9a-f]/gi, '0').toLowerCase().padStart(4, '0').slice(-4);
  return `00000000-0000-4000-${cleanPrefix}-${hexNum}`;
}

const categories = [
  { id: uuid('c001', 1), name_en: 'Romantic', name_urdu: 'رومانوی', books_count: 24 },
  { id: uuid('c001', 2), name_en: 'Islamic & Reform', name_urdu: 'اصلاحی / دینی', books_count: 18 },
  { id: uuid('c001', 3), name_en: 'Thriller & Suspense', name_urdu: 'سسپنس / سنسنی خیز', books_count: 12 },
  { id: uuid('c001', 4), name_en: 'Social Drama', name_urdu: 'سماجی ڈرامہ', books_count: 15 },
  { id: uuid('c001', 5), name_en: 'Historical', name_urdu: 'تاریخی داستان', books_count: 9 },
  { id: uuid('c001', 6), name_en: 'Mystery & Supernatural', name_urdu: 'پراسرار / پرپیچ', books_count: 8 },
  { id: uuid('c001', 7), name_en: 'Poetry & Ghazals', name_urdu: 'شاعری و غزل', books_count: 5 },
  { id: uuid('c001', 8), name_en: 'Action & Adventure', name_urdu: 'ایڈونچر و مہم جوئی', books_count: 7 }
];

const authors = [
  {
    id: uuid('a001', 1),
    name_en: 'Umera Ahmed',
    name_urdu: 'عمیرہ احمد',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
  },
  {
    id: uuid('a001', 2),
    name_en: 'Nimra Ahmed',
    name_urdu: 'نمرہ احمد',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'
  },
  {
    id: uuid('a001', 3),
    name_en: 'Hashim Nadeem',
    name_urdu: 'ہاشم ندیم',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
  },
  {
    id: uuid('a001', 4),
    name_en: 'Farhat Ishtiaq',
    name_urdu: 'فرحت اشتیاق',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300'
  },
  {
    id: uuid('a001', 5),
    name_en: 'Humaira Raza',
    name_urdu: 'حمیرا رضا',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
  },
  {
    id: uuid('a001', 6),
    name_en: 'Bano Qudsia',
    name_urdu: 'بانو قدسیہ',
    photo_url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=300'
  },
  {
    id: uuid('a001', 7),
    name_en: 'Naseem Hijazi',
    name_urdu: 'نسیم حجازی',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300'
  },
  {
    id: uuid('a001', 8),
    name_en: 'Sadia Batool',
    name_urdu: 'سادیہ بتول',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300'
  }
];

const books = [
  {
    id: uuid('b001', 1),
    title_en: 'Peer-e-Kamil (S.A.W)',
    title_urdu: 'پیر کامل (صلی اللہ علیہ وآلہ وسلم)',
    author_id: uuid('a001', 1), // Umera Ahmed
    category_id: uuid('c001', 2), // Islamic
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    description: 'The legendary masterpiece chronicling the intertwining spiritual transformation and pursuit of the Perfect Mentor by Imama Hashim and Salar Sikandar.',
    is_locked: false,
    status: 'approved',
    total_chapters: 28
  },
  {
    id: uuid('b001', 2),
    title_en: 'Aab-e-Hayat',
    title_urdu: 'آب حیات',
    author_id: uuid('a001', 1), // Umera Ahmed
    category_id: uuid('c001', 2), // Islamic
    cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600',
    description: 'The monumental sequel exploring marital devotion, sacrifice, and the enduring test of spiritual conviction in the midst of worldly trials.',
    is_locked: true,
    status: 'approved',
    total_chapters: 38
  },
  {
    id: uuid('b001', 3),
    title_en: 'Jannat Kay Pattay',
    title_urdu: 'جنت کے پتے',
    author_id: uuid('a001', 2), // Nimra Ahmed
    category_id: uuid('c001', 3), // Thriller & Suspense
    cover_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600',
    description: 'A thrilling spy romance exploring modesty, courage, covert international espionage, and Haya Sulaiman’s transformative journey in Turkey.',
    is_locked: false,
    status: 'approved',
    total_chapters: 32
  },
  {
    id: uuid('b001', 4),
    title_en: 'Namal',
    title_urdu: 'نمل',
    author_id: uuid('a001', 2), // Nimra Ahmed
    category_id: uuid('c001', 3), // Thriller & Suspense
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    description: 'An intricate legal thriller woven around Surah An-Naml, investigating high-profile murder, loyalty, and deep forensic deduction.',
    is_locked: true,
    status: 'approved',
    total_chapters: 30
  },
  {
    id: uuid('b001', 5),
    title_en: 'Mushaf',
    title_urdu: 'مصحف',
    author_id: uuid('a001', 2), // Nimra Ahmed
    category_id: uuid('c001', 2), // Islamic & Reform
    cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600',
    description: 'A young orphan girl discovers how every question, trial, and heartbreak in her life is directly answered through the living words of the Holy Quran.',
    is_locked: false,
    status: 'approved',
    total_chapters: 22
  },
  {
    id: uuid('b001', 6),
    title_en: 'Pari Zaad',
    title_urdu: 'پری زاد',
    author_id: uuid('a001', 3), // Hashim Nadeem
    category_id: uuid('c001', 4), // Social Drama
    cover_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
    description: 'An iconic tale of an eccentric, pure-hearted poet traversing social hierarchies, art, and the cruel disparity between physical beauty and internal purity.',
    is_locked: false,
    status: 'approved',
    total_chapters: 24
  },
  {
    id: uuid('b001', 7),
    title_en: 'Khuda Aur Mohabbat',
    title_urdu: 'خدا اور محبت',
    author_id: uuid('a001', 3), // Hashim Nadeem
    category_id: uuid('c001', 1), // Romantic
    cover_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600',
    description: 'A classic spiritual romance where intense earthly love (Ishq-e-Majazi) elevates the soul towards the ultimate divine devotion (Ishq-e-Haqeeqi).',
    is_locked: true,
    status: 'approved',
    total_chapters: 18
  },
  {
    id: uuid('b001', 8),
    title_en: 'Humsafar',
    title_urdu: 'ہم سفر',
    author_id: uuid('a001', 4), // Farhat Ishtiaq
    category_id: uuid('c001', 1), // Romantic
    cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
    description: 'The beloved cultural phenomenon depicting marriage, trust, deep deceit, and the emotional reunion of Ashar and Khirad.',
    is_locked: false,
    status: 'approved',
    total_chapters: 16
  },
  {
    id: uuid('b001', 9),
    title_en: 'Diyar-e-Dil',
    title_urdu: 'دیار دل',
    author_id: uuid('a001', 4), // Farhat Ishtiaq
    category_id: uuid('c001', 4), // Social Drama
    cover_url: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=600',
    description: 'A multigenerational saga set in the rugged mountains of Skardu, celebrating family loyalty, grandfatherly pride, and healing past estrangements.',
    is_locked: true,
    status: 'approved',
    total_chapters: 20
  },
  {
    id: uuid('b001', 10),
    title_en: 'Raja Gidh',
    title_urdu: 'راجہ گدھ',
    author_id: uuid('a001', 6), // Bano Qudsia
    category_id: uuid('c001', 4), // Social Drama
    cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600',
    description: 'The monumental socio-philosophical allegory examining mental devolution resulting from the consumption of forbidden sustenance (Rizq-e-Haram).',
    is_locked: false,
    status: 'approved',
    total_chapters: 26
  },
  {
    id: uuid('b001', 11),
    title_en: 'Khaak aur Khoon',
    title_urdu: 'خاک اور خون',
    author_id: uuid('a001', 7), // Naseem Hijazi
    category_id: uuid('c001', 5), // Historical
    cover_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600',
    description: 'An epic historic narrative capturing the heroic sacrifices, partition struggles, and monumental journey of the subcontinent Muslims in 1947.',
    is_locked: false,
    status: 'approved',
    total_chapters: 19
  },
  {
    id: uuid('b001', 12),
    title_en: 'Siyah Shaam',
    title_urdu: 'سیاہ شام',
    author_id: uuid('a001', 5), // Humaira Raza
    category_id: uuid('c001', 6), // Mystery
    cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    description: 'A chilling nocturnal mystery surrounding an ancestral haveli in Murree and an unsolved disappearance echoing through 40 winters.',
    is_locked: true,
    status: 'pending',
    total_chapters: 12
  }
];

const sampleUrduProse1 = `پہلا باب: تلاشِ منزل

زندگی کے سفر میں اکثر انسان ایسے موڑ پر آ کھڑا ہوتا ہے جہاں راستے دھندلے اور منزلیں اوجھل محسوس ہوتی ہیں۔ عمارت کی بالکونی پر کھڑے سالار نے سرد ہوا کے جھونکے کو محسوس کیا۔ اس کی آنکھوں میں ویرانی کے ساتھ ساتھ ایک غیر معمولی تجسس بھی تھا۔

"کیا انسان اپنی تمام تر ذہانت اور دولت کے باوجود دل کے سکون سے محروم رہ سکتا ہے؟" اس نے اپنے آپ سے سرگوشی کی۔

دوسری طرف، امامہ نے کھڑکی سے باہر چاند کو دیکھا۔ اس کے چہرے پر استقامت اور ایمان کی نورانی روشنی تھی۔ اس نے فیصلہ کر لیا تھا کہ حق کے راستے پر چلتے ہوئے اگر سارا زمانہ بھی مخالف ہو جائے تو وہ قدم پیچھے نہیں ہٹائے گی۔

یہ کہانی دراصل انسان کے اندر چھپی اس پیاس کی ہے جسے صرف اور صرف سچی ہدایت اور محبتِ کامل ہی بجھا سکتی ہے۔`;

const sampleUrduProse2 = `دوسرا باب: امتحان اور قربانی

صبح کی پہلی کرن کے ساتھ ہی حویلی کے صحن میں رونق پھیل گئی۔ چڑیوں کی چہچہاہٹ اور گلاب کی مہک نے ماحول کو معطر کر رکھا تھا، مگر حیا کے دل میں ایک انوکھا طوفان برپا تھا۔

اس نے استنبول کے سفر کی دستاویزات پر ایک بار پھر نگاہ ڈالی۔ سامنے رکھا ہوا سرخ سکارف اس کی نئی زندگی، نئے حیا اور قربانیوں کی یاد دلا رہا تھا۔

"اللہ جسے چاہے عزت دے اور جسے چاہے آزمائش میں ڈال دے، لیکن صبر کرنے والوں کے ساتھ اللہ کی مدد ہمیشہ رہتی ہے۔"

اس کے دل نے گواہی دی کہ آنے والا کل خواہ کتنا ہی کٹھن کیوں نہ ہو، سچائی کی فتح یقینی ہے۔`;

const chapters = [
  {
    id: uuid('ch01', 1),
    book_id: uuid('b001', 1), // Peer-e-Kamil
    chapter_no: 1,
    title_en: 'Chapter 1: The First Encounter',
    title_urdu: 'باب اول: پہلا پڑاؤ اور آغاز',
    content_type: 'text',
    content_text_urdu: sampleUrduProse1,
    content_pdf_url: null,
    word_count: 2450
  },
  {
    id: uuid('ch01', 2),
    book_id: uuid('b001', 1),
    chapter_no: 2,
    title_en: 'Chapter 2: The Crossroads of Destiny',
    title_urdu: 'باب دوم: دو راہے پر کھڑی زندگی',
    content_type: 'text',
    content_text_urdu: sampleUrduProse2,
    content_pdf_url: null,
    word_count: 3100
  },
  {
    id: uuid('ch01', 3),
    book_id: uuid('b001', 1),
    chapter_no: 3,
    title_en: 'Chapter 3: The Light of Guidance',
    title_urdu: 'باب سوم: نورِ ہدایت کی تجلی',
    content_type: 'text',
    content_text_urdu: sampleUrduProse1,
    content_pdf_url: null,
    word_count: 2890
  },
  {
    id: uuid('ch01', 4),
    book_id: uuid('b001', 3), // Jannat Kay Pattay
    chapter_no: 1,
    title_en: 'Chapter 1: The Red Scarf',
    title_urdu: 'باب اول: سرخ سکارف اور نیا عزم',
    content_type: 'text',
    content_text_urdu: sampleUrduProse2,
    content_pdf_url: null,
    word_count: 3400
  },
  {
    id: uuid('ch01', 5),
    book_id: uuid('b001', 3),
    chapter_no: 2,
    title_en: 'Chapter 2: Istanbul Whispers',
    title_urdu: 'باب دوم: استنبول کی پرپیچ گلیاں',
    content_type: 'text',
    content_text_urdu: sampleUrduProse1,
    content_pdf_url: null,
    word_count: 2980
  },
  {
    id: uuid('ch01', 6),
    book_id: uuid('b001', 6), // Pari Zaad
    chapter_no: 1,
    title_en: 'Chapter 1: The Dark Mirror',
    title_urdu: 'باب اول: آئینے کا عکس اور دل کی آواز',
    content_type: 'text',
    content_text_urdu: sampleUrduProse1,
    content_pdf_url: null,
    word_count: 2150
  },
  {
    id: uuid('ch01', 7),
    book_id: uuid('b001', 10), // Raja Gidh
    chapter_no: 1,
    title_en: 'Chapter 1: The Theory of Desire',
    title_urdu: 'باب اول: خواہش اور حلال و حرام کا فلسفہ',
    content_type: 'text',
    content_text_urdu: sampleUrduProse1,
    content_pdf_url: null,
    word_count: 4200
  }
];

const withdrawals = [
  {
    id: uuid('f001', 1),
    user_id: null,
    points: 5000,
    pkr_amount: 500,
    method: 'JazzCash',
    account_title: 'Muhammad Usman Khan',
    account_number: '03001234567',
    tasks_chapters: 65,
    tasks_ads: 25,
    tasks_invites: 4,
    status: 'pending'
  },
  {
    id: uuid('f001', 2),
    user_id: null,
    points: 10000,
    pkr_amount: 1000,
    method: 'Easypaisa',
    account_title: 'Zainab Bibi',
    account_number: '03459876543',
    tasks_chapters: 120,
    tasks_ads: 40,
    tasks_invites: 6,
    status: 'approved'
  },
  {
    id: uuid('f001', 3),
    user_id: null,
    points: 2500,
    pkr_amount: 250,
    method: 'JazzCash',
    account_title: 'Ali Raza Gillani',
    account_number: '03025554321',
    tasks_chapters: 35,
    tasks_ads: 12,
    tasks_invites: 1,
    status: 'pending'
  }
];

async function seed() {
  console.log('--- Starting Supabase Seeding ---');

  // 1. Categories
  console.log('1. Seeding categories...');
  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert([cat], { onConflict: 'id' });
    if (error) console.error('  Category error:', cat.name_en, error.message);
    else console.log('  Category upserted:', cat.name_en);
  }

  // 2. Authors
  console.log('2. Seeding authors...');
  for (const auth of authors) {
    const { error } = await supabase.from('authors').upsert([auth], { onConflict: 'id' });
    if (error) console.error('  Author error:', auth.name_en, error.message);
    else console.log('  Author upserted:', auth.name_en);
  }

  // 3. Books
  console.log('3. Seeding books (Urdu novels)...');
  for (const b of books) {
    const { error } = await supabase.from('books').upsert([b], { onConflict: 'id' });
    if (error) console.error('  Book error:', b.title_en, error.message);
    else console.log('  Book upserted:', b.title_en);
  }

  // 4. Chapters
  console.log('4. Seeding sample chapters with Urdu text...');
  for (const ch of chapters) {
    const { error } = await supabase.from('chapters').upsert([ch], { onConflict: 'id' });
    if (error) console.error('  Chapter error:', ch.title_en, error.message);
    else console.log('  Chapter upserted:', ch.title_en);
  }

  // 5. Withdrawal requests
  console.log('5. Seeding withdrawal test requests...');
  for (const w of withdrawals) {
    const { error } = await supabase.from('withdrawal_requests').upsert([w], { onConflict: 'id' });
    if (error) console.error('  Withdrawal error:', w.account_title, error.message);
    else console.log('  Withdrawal upserted:', w.account_title);
  }

  console.log('--- Seeding Completed Successfully! ---');
}

seed();
