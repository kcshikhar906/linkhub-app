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
  Users,
  Siren,
  Building,
  HeartHandshake,
  ShieldCheck,
  Mail,
  MapPin,
  Gavel,
  Vote,
  Baby,
  HandHelping,
  Factory,
  MessageSquare,
  ShieldAlert,
  Palmtree,
  Leaf,
  Server,
  Wrench,
  Tractor,
} from 'lucide-react';
import { Timestamp, type DocumentData, type QueryDocumentSnapshot, type ServerTimestamp } from 'firebase/firestore';


export type Service = {
  id: string;
  title: string;
  description: string;
  link: string;
  categorySlug: string;
  status: 'published' | 'disabled';
  country: string; // e.g., 'AU', 'NP'
  state?: string; // e.g., 'NSW', 'VIC'
  verified?: boolean;
  serviceType: 'guide' | 'info';
  steps?: string[] | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  tags?: string[];
  iconDataUri?: string | null;
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
    notes?: string;
    country: string;
    state?: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Timestamp | ServerTimestamp;
}

export type ReportedLink = {
    id: string;
    serviceId: string;
    serviceTitle: string;
    reportedAt: Timestamp | ServerTimestamp;
    reporterEmail: string;
    reason: string;
    status: 'pending' | 'resolved';
    country: string;
    state?: string;
}

// Object of available icons
export const ICONS: { [key: string]: LucideIcon } = {
    // New
    Briefcase, // Business & Corporate
    MessageSquare, // Communications
    ShieldAlert, // Consumer & Rights Protection
    Car, // Driving & Transport
    GraduationCap, // Education & Training
    Siren, // Emergency Services
    Baby, // Family & Community
    Vote, // Government & Civic Duty
    HeartPulse, // Health & Medical
    Home, // Housing & Property
    Gavel, // Legal & Justice
    Banknote, // Money & Taxes
    MountainSnow, // Nepal Specific
    HandHelping, // Social & Community Support
    Plane, // Visas & Immigration
    Factory, // Work & Employment
    Palmtree, // Tourism, Arts & Culture
    Leaf, // Environment & Sustainability
    Server, // Technology & Digital Services
    Wrench, // Utilities & Infrastructure
    Tractor, // Agriculture & Rural Development

    // Old (kept for compatibility)
    Landmark,
    Scale,
    Users,
    Building,
    HeartHandshake,
    ShieldCheck,
    Mail,
    MapPin,
};


// Helper to get Lucide icon component from string name
export const getIcon = (name: string): LucideIcon => {
  return ICONS[name] || Home; // Return a default icon if not found
};

export const serviceConverter = {
    fromFirestore: (snapshot: QueryDocumentSnapshot): Service => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            title: data.title,
            description: data.description,
            link: data.link,
            categorySlug: data.categorySlug,
            status: data.status || 'published',
            country: data.country,
            state: data.state,
            verified: data.verified || false,
            serviceType: data.serviceType || 'guide',
            steps: data.steps,
            phone: data.phone,
            email: data.email,
            address: data.address,
            tags: data.tags || [],
            iconDataUri: data.iconDataUri,
        };
    },
    toFirestore: (service: Partial<Service>): DocumentData => {
        const dataToUpdate: DocumentData = { ...service };
        
        // Ensure type-specific fields are null if not applicable
        if (service.serviceType === 'guide') {
            dataToUpdate.phone = null;
            dataToUpdate.email = null;
            dataToUpdate.address = null;
        } else if (service.serviceType === 'info') {
            dataToUpdate.steps = null;
        }
        
        // Convert undefined to null for all relevant fields
        for (const key of ['steps', 'phone', 'email', 'address', 'state', 'tags', 'iconDataUri']) {
            if (dataToUpdate[key] === undefined) {
                dataToUpdate[key] = null;
            }
        }
        
        return dataToUpdate;
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
        const submittedAt = data.submittedAt instanceof Timestamp ? data.submittedAt : new Timestamp(0,0);
        return {
            id: snapshot.id,
            title: data.title,
            url: data.url,
            categorySlug: data.categorySlug,
            notes: data.notes,
            country: data.country,
            state: data.state,
            status: data.status || 'pending',
            submittedAt: submittedAt,
        };
    },
    toFirestore: (submission: Partial<Omit<SubmittedLink, 'id'>>): DocumentData => {
        const data: DocumentData = {
           ...submission
        };
        if (data.status === undefined) {
            data.status = 'pending';
        }
        return data;
    }
}

export const reportConverter = {
    fromFirestore: (snapshot: QueryDocumentSnapshot): ReportedLink => {
        const data = snapshot.data();
        // The reportedAt field might be a Timestamp or null if just sent
        const reportedAt = data.reportedAt instanceof Timestamp ? data.reportedAt : new Timestamp(0,0);
        return {
            id: snapshot.id,
            serviceId: data.serviceId,
            serviceTitle: data.serviceTitle,
            reportedAt: reportedAt,
            reporterEmail: data.reporterEmail,
            reason: data.reason,
            status: data.status,
            country: data.country,
            state: data.state,
        };
    },
    toFirestore: (report: Partial<Omit<ReportedLink, 'id'>>): DocumentData => {
        return {
            ...report,
        };
    }
}
