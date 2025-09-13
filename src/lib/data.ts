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
  Phone,
  Siren,
  Building,
  HeartHandshake,
  ShieldCheck,
  Mail,
  MapPin,
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
  steps?: string[];
  phone?: string;
  email?: string;
  address?: string;
  tags?: string[];
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
    Users,
    Phone,
    Siren,
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
        };
    },
    toFirestore: (service: Partial<Service>): DocumentData => {
        // Create a copy to avoid modifying the original object
        const serviceData = { ...service };

        // Ensure type-specific fields are null if not applicable
        if (serviceData.serviceType === 'guide') {
            serviceData.phone = null;
            serviceData.email = null;
            serviceData.address = null;
            serviceData.steps = serviceData.steps || [];
        } else if (serviceData.serviceType === 'info') {
            serviceData.steps = null;
            serviceData.phone = serviceData.phone || null;
            serviceData.email = serviceData.email || null;
            serviceData.address = serviceData.address || null;
        }

        // Firestore does not allow `undefined` values.
        // We can remove them, but it's better practice for updates
        // to explicitly set unused fields to null.
        const dataToUpdate: DocumentData = {};
        for (const key in serviceData) {
            const value = (serviceData as any)[key];
            if (value !== undefined) {
                dataToUpdate[key] = value;
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
            email: data.email,
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
