import {
  Plane,
  Landmark,
  HeartPulse,
  GraduationCap,
  Car,
  Banknote,
  MountainSnow,
  type LucideIcon,
} from 'lucide-react';

export type Service = {
  id: string;
  title: string;
  description: string;
  steps: string[];
  link: string;
  categorySlug: string;
};

export type Category = {
  name: string;
  slug: string;
  icon: LucideIcon;
};

export const CATEGORIES: Category[] = [
  { name: 'Immigration', slug: 'immigration', icon: Plane },
  { name: 'Tax', slug: 'tax', icon: Landmark },
  { name: 'Healthcare', slug: 'healthcare', icon: HeartPulse },
  { name: 'Education', slug: 'education', icon: GraduationCap },
  { name: 'Transport', slug: 'transport', icon: Car },
  { name: 'Banking', slug: 'banking', icon: Banknote },
  { name: 'Nepal-Specific', slug: 'nepal-specific', icon: MountainSnow },
];

export const SERVICES: Service[] = [
  // Immigration
  {
    id: '1',
    title: 'Renew a Student Visa (subclass 500)',
    description: 'Extend your stay in Australia to continue your studies.',
    steps: [
      'Check your eligibility and current visa conditions.',
      'Gather required documents, including your new Confirmation of Enrolment (CoE).',
      'Complete the online application via your ImmiAccount.',
      'Pay the visa application charge.',
      'Await a decision. You may be granted a Bridging visa A (BVA).',
    ],
    link: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500',
    categorySlug: 'immigration',
  },
  {
    id: '2',
    title: 'Apply for a Post-Study Work Visa (subclass 485)',
    description:
      'Stay in Australia to work for a temporary period after you have finished your studies.',
    steps: [
      'Ensure you hold an eligible visa and meet the Australian study requirement.',
      'Gather documents, including identity, study, and health insurance.',
      'Apply within 6 months of completing your course.',
      'Submit your application online via ImmiAccount.',
    ],
    link: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485',
    categorySlug: 'immigration',
  },

  // Tax
  {
    id: '3',
    title: 'Apply for a Tax File Number (TFN)',
    description:
      'A TFN is your personal reference number for the Australian tax and superannuation systems.',
    steps: [
      'Go to the Australian Taxation Office (ATO) website.',
      'Complete the online form with your passport and travel details.',
      'Submit the application.',
      'Your TFN will be mailed to the Australian address you provide.',
    ],
    link: 'https://www.ato.gov.au/individuals-and-families/tax-file-number/apply-for-a-tfn',
    categorySlug: 'tax',
  },
  {
    id: '4',
    title: 'Lodge Your First Tax Return',
    description:
      'If you\'ve earned money in Australia, you may need to lodge a tax return.',
    steps: [
      'Create a myGov account and link it to the ATO.',
      'Gather your income statements, TFN, and bank account details.',
      'Use myTax, the ATO\'s free online tool, to fill out your return.',
      'Review the estimate and submit your return by the 31 October deadline.',
    ],
    link: 'https://www.ato.gov.au/individuals-and-families/your-tax-return',
    categorySlug: 'tax',
  },

  // Healthcare
  {
    id: '5',
    title: 'Get Overseas Student Health Cover (OSHC)',
    description:
      'A mandatory health insurance for international students in Australia.',
    steps: [
      'Compare approved OSHC providers online.',
      'Choose a policy that suits your needs (single, couple, or family).',
      'Purchase the cover for the entire duration of your visa.',
      'Receive your OSHC certificate, which is needed for your visa application.',
    ],
    link: 'https://www.privatehealth.gov.au/health_insurance/overseas/overseas_student_health_cover.htm',
    categorySlug: 'healthcare',
  },

  // Transport
  {
    id: '6',
    title: 'Get an Adult Opal Card (NSW)',
    description:
      'A smartcard ticket that you use to pay for travel on public transport in NSW.',
    steps: [
      'Order an Opal card online or find a local retailer.',
      'Top up your card with a minimum amount.',
      'Tap on when you start your journey and tap off when you end.',
      'Register your card online to protect your balance if it gets lost or stolen.',
    ],
    link: 'https://transportnsw.info/tickets-opal/opal/get-opal-card',
    categorySlug: 'transport',
  },
  {
    id: '7',
    title: 'Convert Your Overseas Driver License (NSW)',
    description:
      'If you\'re a permanent resident, you must convert your license within 3 months.',
    steps: [
      'Visit a Service NSW Centre.',
      'Bring your overseas license, proof of identity, and proof of NSW residency.',
      'Pass a knowledge test, driving test, and eyesight test if required.',
      'Receive your NSW driver license.',
    ],
    link: 'https://www.nsw.gov.au/driving-boating-and-transport/driver-and-rider-licences/visiting-or-moving-to-nsw/transferring-overseas-licence',
    categorySlug: 'transport',
  },

  // Banking
  {
    id: '8',
    title: 'Open an Australian Bank Account',
    description:
      'Essential for receiving salary, paying bills, and managing your finances.',
    steps: [
      'Choose a bank. Major banks include CommBank, ANZ, Westpac, and NAB.',
      'You can often start the application online from overseas.',
      'Visit a branch upon arrival with your passport and visa details to verify your identity.',
      'Receive your debit card and set up online banking.',
    ],
    link: 'https://www.commbank.com.au/moving-to-australia.html',
    categorySlug: 'banking',
  },
  
  // Nepal-Specific
  {
    id: '9',
    title: 'Embassy of Nepal, Canberra',
    description: 'Official diplomatic mission of Nepal in Australia for consular services and information.',
    steps: [
        'Visit the official website for contact details and opening hours.',
        'For passport renewal, visa services, or attestations, check the required documents online.',
        'Book an appointment if necessary for your service.',
        'Visit the embassy in Canberra for your consular needs.'
    ],
    link: 'https://au.nepalembassy.gov.np/',
    categorySlug: 'nepal-specific'
  },
  {
    id: '10',
    title: 'Compare Remittance Services to Nepal',
    description: 'Find the best exchange rates and lowest fees for sending money from Australia to Nepal.',
    steps: [
        'Use online comparison tools to check live rates from various services.',
        'Consider transfer speed, fees, and pickup options in Nepal.',
        'Sign up for a chosen service with your ID.',
        'Initiate the transfer and track its progress.',
    ],
    link: 'https://www.finder.com.au/send-money-to-nepal',
    categorySlug: 'nepal-specific'
  },
  {
    id: '11',
    title: 'Non-Resident Nepali Association (NRNA) Australia',
    description: 'A global organization of the Nepali diaspora, promoting community, culture, and interests.',
    steps: [
      'Visit the NRNA Australia website to learn about their mission and events.',
      'Find your local state or territory coordination council.',
      'Become a member to connect with the Nepali community.',
      'Participate in cultural events, charity work, and advocacy programs.'
    ],
    link: 'https://nrna.org.au/',
    categorySlug: 'nepal-specific'
  },
];
