import {
  Plane,
  Landmark,
  HeartPulse,
  GraduationCap,
  Car,
  Banknote,
  MountainSnow,
  type LucideIcon,
  Home,
  Briefcase,
  Scale,
} from 'lucide-react';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export type Service = {
  id: string;
  title: string;
  description: string;
  steps: string[];
  link: string;
  categorySlug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  iconName: string; // Store icon name as string
};


export type SubmittedLink = {
    id: string;
    title: string;
    url: string;
    categorySlug: string;
    email: string;
    notes?: string;
}

// Helper to get Lucide icon component from string name
export const getIcon = (name: string): LucideIcon => {
  const icons: { [key: string]: LucideIcon } = {
    Plane,
    Landmark,
    HeartPulse,
    GraduationCap,
    Car,
    Banknote,
    MountainSnow,
    Home,
    Briefcase,
    Scale,
  };
  return icons[name] || Home; // Return a default icon if not found
};

export const serviceConverter = {
    fromFirestore: (snapshot: QueryDocumentSnapshot): Service => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            title: data.title,
            description: data.description,
            steps: data.steps,
            link: data.link,
            categorySlug: data.categorySlug
        };
    },
    toFirestore: (service: Omit<Service, 'id'>): DocumentData => {
        return {
            title: service.title,
            description: service.description,
            steps: service.steps,
            link: service.link,
            categorySlug: service.categorySlug
        };
    }
};

export const categoryConverter = {
    fromFirestore: (snapshot: QueryDocumentSnapshot): Category => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            name: data.name,
            slug: data.slug,
            iconName: data.iconName
        };
    },
    toFirestore: (category: Omit<Category, 'id'>): DocumentData => {
        return {
            name: category.name,
            slug: category.slug,
            iconName: category.iconName
        };
    }
};

export const submissionConverter = {
    fromFirestore: (snapshot: QueryDocumentSnapshot): SubmittedLink => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            title: data.title,
            url: data.url,
            categorySlug: data.categorySlug,
            email: data.email,
            notes: data.notes
        };
    },
    toFirestore: (submission: Omit<SubmittedLink, 'id'>): DocumentData => {
        return {
            title: submission.title,
            url: submission.url,
            categorySlug: submission.categorySlug,
            email: submission.email,
            notes: submission.notes
        };
    }
}