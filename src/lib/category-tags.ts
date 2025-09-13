/**
 * @fileoverview Defines a rule-based mapping of category slugs to their allowed sub-category tags.
 * This provides a structured way to manage filtering options for each category.
 */

export const CATEGORY_TAGS: { [key: string]: string[] } = {
  // Visas & Immigration
  'visas-and-immigration': [
    'Student Visa',
    'Work Visa',
    'Permanent Residency',
    'Visa Extension',
    'Family & Partner Visas',
    'Citizenship',
    'Bridging Visa',
    'Appeals & Tribunals',
  ],

  // Government Services
  'government-services': [
    'Taxation (TFN/ABN)',
    'Centrelink/Welfare',
    'Medicare',
    'Driving & Licenses',
    'Legal & Justice',
    'Postal Services',
    'Voting & Elections',
  ],
  
  // Health & Wellbeing
  'health-and-wellbeing': [
    'General Practitioner (GP)',
    'Hospital',
    'Dentist',
    'Mental Health',
    'Allied Health (Physio, etc.)',
    'Sexual Health',
    'Emergency Services',
  ],
  
  // Education & Training
  'education-and-training': [
    'University',
    'TAFE/VET College',
    'Registered Training Org (RTO)',
    'English Course (IELTS/PTE)',
    'High School',
    'Educational Consultancy',
  ],
  
  // Driving & Transport
  'driving-and-transport': [
    'License Application',
    'Vehicle Registration',
    'Public Transport',
    'Driving School',
    'Ride Share',
  ],
  
  // Finance & Banking
  'finance-and-banking': [
    'Bank Account',
    'Superannuation',
    'Remittance/Money Transfer',
    'Financial Advice',
    'Insurance',
    'Loans & Mortgages',
  ],

  // Nepal Specific
  'nepal-specific': [
    'Embassy/Consulate Services',
    'Community Organizations',
    'Travel to Nepal',
    'Cultural Events',
    'Nepalese Restaurants',
    'Business & Trade',
  ],

  // Housing & Accommodation
  'housing-and-accommodation': [
    'Renting',
    'Buying Property',
    'Utilities (Gas, Electricity)',
    'Internet & Phone',
    'Real Estate Agent',
    'Short-term Stays',
  ],

  // Professional Services
  'professional-services': [
    'Accountant',
    'Lawyer/Solicitor',
    'Migration Agent',
    'Marketing Agency',
    'Web Developer',
    'Recruitment Agency',
  ],

  // Legal & Justice
  'legal-and-justice': [
    'Community Legal Centres',
    'Police',
    'Court System',
    'Victim Support',
    'Dispute Resolution',
  ],

  // Community & Social
  'community-and-social': [
    'Social Groups',
    'Sports Clubs',
    'Religious Centers',
    'Volunteering',
    'Childcare',
    'Aged Care',
  ],

  // Emergency Services
  'emergency-services': [
    'Police',
    'Ambulance',
    'Fire & Rescue',
    'Poisons Information',
    'Emergency Helplines',
  ],
};
