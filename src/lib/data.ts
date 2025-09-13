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
        };
    },
    toFirestore: (service: Partial<Service>): DocumentData => {
        const data: DocumentData = {};
        if (service.title !== undefined) data.title = service.title;
        if (service.description !== undefined) data.description = service.description;
        if (service.link !== undefined) data.link = service.link;
        if (service.categorySlug !== undefined) data.categorySlug = service.categorySlug;
        if (service.status !== undefined) data.status = service.status;
        if (service.country !== undefined) data.country = service.country;
        if (service.state !== undefined) data.state = service.state;
        if (service.verified !== undefined) data.verified = service.verified;
        if (service.serviceType !== undefined) data.serviceType = service.serviceType;
        
        // Handle type-specific fields
        if (service.serviceType === 'guide') {
            data.steps = service.steps || [];
            data.phone = null;
            data.email = null;
            data.address = null;
        } else if (service.serviceType === 'info') {
            data.steps = null;
            data.phone = service.phone || null;
            data.email = service.email || null;
            data.address = service.address || null;
        }
        
        return data;
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
