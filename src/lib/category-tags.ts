/**
 * @fileoverview Defines a rule-based mapping of category slugs to their allowed sub-category tags.
 * This provides a structured way to manage filtering options for each category.
 */

export const CATEGORY_TAGS: { [key: string]: string[] } = {
  // Business & Corporate
  'business-and-corporate': [
    'Company registration & licensing',
    'Trade & export/import',
    'Small business support',
    'Business taxes & compliance',
    'Corporate governance',
    'Chambers of commerce & associations',
    'Investment & entrepreneurship',
    'Startups & innovation hubs',
  ],

  // Communications
  'communications': [
    'Postal services',
    'Telecommunications providers',
    'Internet & broadband',
    'Broadcasting & media regulation',
    'Freedom of information',
    'Digital services & e-Gov platforms',
  ],

  // Consumer & Rights Protection
  'consumer-and-rights': [
    'Consumer rights & complaints',
    'Product safety & recalls',
    'Fair trading & anti-fraud',
    'Data protection & privacy',
    'Ombudsman services',
    'Disability rights & protections',
    'Labor rights',
  ],

  // Driving & Transport
  'driving-and-transport': [
    'Driver licensing',
    'Vehicle registration',
    'Public transport',
    'Road safety & traffic rules',
    'Aviation (domestic flights)',
    'Railways',
    'Ports & shipping',
    'Ride-sharing & taxis',
  ],

  // Education & Training
  'education-and-training': [
    'Schools & K–12',
    'Colleges & universities',
    'Vocational training & skills',
    'Scholarships & financial aid',
    'Study abroad consultancies',
    'Online learning platforms',
    'Recognition of foreign qualifications',
  ],

  // Emergency Services
  'emergency-services': [
    'Police & crime reporting',
    'Fire services',
    'Ambulance & paramedics',
    'Disaster preparedness & response',
    'Emergency hotlines (e.g. 000, 100)',
    'Missing persons & rescue services',
  ],

  // Family & Community
  'family-and-community': [
    'Births, deaths & marriages',
    'Childcare & parenting support',
    'Family law & custody',
    'Youth programs',
    'Senior citizen services',
    'Marriage registration',
    'Adoption services',
    'Religious & cultural organizations',
  ],

  // Government & Civic Duty
  'government-civic-duty': [
    'Voting & elections',
    'National ID & citizenship',
    'Passports',
    'Military & national service',
    'Local government councils & municipalities',
    'Transparency & open data',
  ],

  // Health & Medical
  'health-and-medical': [
    'Hospitals & clinics',
    'Health insurance & Medicare (Aus) / Health schemes (Nepal)',
    'Mental health support',
    'Vaccinations & immunizations',
    'Pharmacies & medicine regulations',
    'Public health campaigns',
    'Disability services',
    'Emergency healthcare',
  ],

  // Housing & Property
  'housing-and-property': [
    'Renting & tenancy rights',
    'Buying & selling property',
    'Housing loans & mortgages',
    'Land registration & ownership',
    'Building permits & zoning',
    'Public housing & subsidies',
    'Real estate agents',
  ],

  // Legal & Justice
  'legal-and-justice': [
    'Courts & judiciary',
    'Legal aid & free services',
    'Lawyers & law firms directories',
    'Civil & criminal law resources',
    'Police & crime laws',
    'Prisons & corrections',
    'Alternative dispute resolution (ADR)',
    'Anti-corruption agencies',
  ],

  // Money & Taxes
  'money-and-taxes': [
    'Personal taxation',
    'Business taxation',
    'Banking & financial institutions',
    'Loans & credit',
    'Superannuation / pensions',
    'Foreign exchange & remittances',
    'Budgeting & financial literacy',
    'Investment opportunities',
  ],

  // Nepal Specific
  'nepal-specific': [
    'Nepal embassies & consulates',
    'Provincial & local governments',
    'National symbols & identity (flag, anthem, heritage)',
    'Tourism boards & trekking permits',
    'Mountaineering associations',
    'Rural development programs',
  ],

  // Social & Community Support
  'social-and-community-support': [
    'NGOs & nonprofits',
    'Volunteer programs',
    'Community centers',
    'Homelessness services',
    'Welfare & allowances',
    'Food security programs',
    'Charities & donations',
  ],

  // Visas & Immigration
  'visas-and-immigration': [
    'Tourist visas',
    'Student visas',
    'Work visas',
    'Skilled migration',
    'Permanent residency',
    'Citizenship application',
    'Refugee & humanitarian visas',
    'Immigration consultancies',
    'Border security & customs',
  ],

  // Work & Employment
  'work-and-employment': [
    'Job portals & recruitment agencies',
    'Work rights & labor laws',
    'Professional licensing (engineers, nurses, etc.)',
    'Apprenticeships & internships',
    'Workplace safety',
    'Trade unions & workers’ associations',
    'Freelance & gig economy resources',
  ],
};
