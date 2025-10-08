
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { type SubmittedContact, submissionConverter } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Loader2, Mail, Phone, ShoppingBag, Link as LinkIcon, Calendar, Home } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ResolvedInquiriesPage() {
  const [resolved, setResolved] = useState<SubmittedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, 'submissions'),
      where('status', '==', 'resolved'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q.withConverter(submissionConverter), (snapshot) => {
      setResolved(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const SubmissionTypeIcon = ({ type }: { type: SubmittedContact['submissionType']}) => {
    switch (type) {
        case 'service': return <LinkIcon className="h-4 w-4" />;
        case 'shop': return <ShoppingBag className="h-4 w-4" />;
        case 'event': return <Calendar className="h-4 w-4" />;
        default: return <Home className="h-4 w-4" />;
    }
  }

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Resolved Inquiries
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Archived Submissions</CardTitle>
          <CardDescription>
            A historical record of all submissions that have been marked as resolved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : resolved.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No inquiries have been resolved yet.</p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-6">
                {resolved.map(sub => (
                  <Card key={sub.id} className="bg-muted/50">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-base font-semibold leading-tight flex items-center gap-2">
                                    <SubmissionTypeIcon type={sub.submissionType} />
                                    <span className="capitalize">{sub.submissionType} Submission</span>
                                </CardTitle>
                                <p className="text-xs text-muted-foreground pt-1">
                                    from {sub.name}
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground pt-3 space-y-2">
                           <a href={`mailto:${sub.email}`} className="flex items-center gap-2 hover:text-primary">
                                <Mail className="h-4 w-4 flex-shrink-0" /> {sub.email}
                            </a>
                            {sub.phone && (
                                <a href={`tel:${sub.phone}`} className="flex items-center gap-2 hover:text-primary">
                                    <Phone className="h-4 w-4 flex-shrink-0" /> {sub.phone}
                                </a>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm italic">&quot;{sub.notes}&quot;</p>
                    </CardContent>
                     <CardFooter className="justify-start text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1.5" />
                        Submitted {sub.submittedAt ? formatDistanceToNow(sub.submittedAt.toDate(), { addSuffix: true }) : 'a while ago'}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    