
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
              <div className="space-y-3 pr-6">
                {resolved.map(sub => (
                  <Card key={sub.id} className="bg-muted/50 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 font-semibold">
                                <SubmissionTypeIcon type={sub.submissionType} />
                                <span className="capitalize">{sub.submissionType} Submission</span>
                            </div>
                            <p className="text-sm text-muted-foreground italic line-clamp-2">
                                &quot;{sub.notes}&quot;
                            </p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col sm:items-end sm:text-right gap-1 text-sm">
                           <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground"/>
                                <span>{sub.name} ({sub.email})</span>
                           </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Submitted {sub.submittedAt ? formatDistanceToNow(sub.submittedAt.toDate(), { addSuffix: true }) : 'a while ago'}
                            </div>
                        </div>
                    </div>
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
