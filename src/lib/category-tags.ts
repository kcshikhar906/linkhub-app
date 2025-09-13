/**
 * @fileoverview Defines a rule-based mapping of category slugs to their allowed sub-category tags.
 * This provides a structured way to manage filtering options for each category.
 */

export const CATEGORY_TAGS: { [key: string]: string[] } = {
  // Example for Education & Training
  'education-and-training': [
    'Educational Consultancy',
    'Education Provider',
    'Training Course',
    'School/College',
    'IELTS/PTE',
  ],

  // Example for Visas & Immigration
  'visas-and-immigration': [
    'Student Visa',
    'Work Visa',
    'Permanent Residency',
    'Visa Extension',
    'Family & Partner Visas',
  ],

  // Example for a business-oriented category
  'business-services': [
    'Accountant',
    'Lawyer',
    'Marketing Agency',
    'Web Developer',
  ],

  // Add more rules as needed for other category slugs
  // 'category-slug': ['Tag 1', 'Tag 2', 'Tag 3'],
};
