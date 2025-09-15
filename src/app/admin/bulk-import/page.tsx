
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, FileCheck2, AlertCircle, Save, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { z } from 'zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { serviceConverter, type Service, type Category, categoryConverter } from '@/lib/data';
import { COUNTRIES } from '@/lib/countries';
import { summarizeLinkCard, type SummarizeLinkCardOutput } from '@/ai/flows/summarize-link-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


const csvRowSchema = z.object({
    link: z.string().url('Invalid URL'),
    categorySlug: z.string().min(1, 'Category slug is required'),
});

type CsvRow = z.infer<typeof csvRowSchema>;

type ProcessedRow = {
    originalData: CsvRow & {[key: string]: any}; // Allow other keys for robust parsing
    status: 'pending' | 'loading' | 'success' | 'error';
    aiData?: SummarizeLinkCardOutput;
    error?: string;
}

export default function BulkImportPage() {
  const { toast } = useToast();
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedRow[]>([]);
  
  // Location state
  const [country, setCountry] = useState('AU');
  const [state, setState] = useState<string | undefined>(undefined);
  
  const statesForCountry = useMemo(() => COUNTRIES.find(c => c.code === country)?.states || [], [country]);

  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== 'text/csv') {
          toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a CSV file.'});
          return;
      }
      setFile(selectedFile);
      setProcessedData([]); // Reset previous preview
    }
  };

  const handleParse = () => {
      if (!file) {
          toast({ variant: 'destructive', title: 'No File Selected', description: 'Please select a CSV file to parse.' });
          return;
      }
      setIsParsing(true);
      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
              const validatedData = results.data.map(row => {
                  const result = csvRowSchema.safeParse(row);
                  if (result.success) {
                    return { originalData: result.data, status: 'pending' as const };
                  }
                  // Handle Zod error formatting
                  const formattedError = result.error.flatten().fieldErrors;
                  const errorMessage = Object.entries(formattedError).map(([key, value]) => `${key}: ${value?.join(', ')}`).join('; ');
                  return { originalData: row as any, status: 'error' as const, error: errorMessage || 'Invalid row structure.' };
              });

              setProcessedData(validatedData);
              setIsParsing(false);
              toast({ title: 'File Parsed', description: 'Review the URLs and categories below before generating data with AI.'});
          },
          error: (error) => {
              console.error("CSV Parsing Error:", error);
              toast({ variant: 'destructive', title: 'Parsing Error', description: 'Could not parse the CSV file.'});
              setIsParsing(false);
          }
      });
  };

  const handleAiGeneration = async () => {
    setIsAiRunning(true);

    const promises = processedData.map(async (row, index) => {
        if (row.status === 'pending') {
            setProcessedData(prev => prev.map((r, i) => i === index ? { ...r, status: 'loading' } : r));
            try {
                const aiResult = await summarizeLinkCard({ url: row.originalData.link, categorySlug: row.originalData.categorySlug });
                setProcessedData(prev => prev.map((r, i) => i === index ? { ...r, status: 'success', aiData: aiResult } : r));
            } catch (error) {
                console.error("AI Error for", row.originalData.link, error);
                setProcessedData(prev => prev.map((r, i) => i === index ? { ...r, status: 'error', error: 'AI summarization failed.' } : r));
            }
        }
        return Promise.resolve();
    });

    await Promise.all(promises);
    setIsAiRunning(false);
    toast({ title: 'AI Processing Complete', description: 'Review the generated data before saving.'});
  }


  const handleSave = async () => {
    const successRows = processedData.filter(r => r.status === 'success');
    if (successRows.length === 0) {
        toast({ variant: 'destructive', title: 'No Data to Save', description: 'There are no successfully processed services to save.'});
        return;
    }

    setIsSaving(true);
    try {
        const batch = writeBatch(db);
        const servicesCollection = collection(db, 'services').withConverter(serviceConverter);

        successRows.forEach(row => {
            if (row.aiData) {
                const serviceDocRef = doc(servicesCollection);
                const serviceData: Omit<Service, 'id'> = {
                    title: row.aiData.title,
                    description: row.aiData.description,
                    link: row.originalData.link,
                    categorySlug: row.originalData.categorySlug,
                    steps: row.aiData.steps,
                    tags: row.aiData.suggestedTags,
                    iconDataUri: row.aiData.iconDataUri,
                    country,
                    state,
                    status: 'published',
                    verified: true, // Assume verified since it's an admin import
                    serviceType: row.aiData.steps.length > 0 ? 'guide' : 'info',
                    phone: null,
                    email: null,
                    address: null,
                };
                batch.set(serviceDocRef, serviceData);
            }
        });

        await batch.commit();

        toast({
            title: 'Success!',
            description: `${successRows.length} services have been imported successfully.`,
        });
        // Reset state
        setFile(null);
        setProcessedData([]);

    } catch (error) {
        console.error("Error saving to Firestore:", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'An error occurred while saving the data to the database.',
        });
    }

    setIsSaving(false);
  }

  const canGenerate = useMemo(() => processedData.length > 0 && processedData.some(r => r.status === 'pending') && !isAiRunning, [processedData, isAiRunning]);
  const canSave = useMemo(() => processedData.length > 0 && processedData.every(r => r.status === 'success' || r.status === 'error'), [processedData]);
  const successfulRowsCount = useMemo(() => processedData.filter(r => r.status === 'success').length, [processedData]);


  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Bulk Import</CardTitle>
          <CardDescription>
            Upload a CSV file with `link` and `categorySlug` headers. The AI will generate the title, description, steps, and tags for each link. Assign a location below, and then save to the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="max-w-xs"
            />
            <Button onClick={handleParse} disabled={!file || isParsing}>
              {isParsing ? <Loader2 className="mr-2 animate-spin" /> : <FileCheck2 className="mr-2" />}
              {isParsing ? 'Parsing...' : 'Preview CSV'}
            </Button>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <Select value={country} onValueChange={(val) => { setCountry(val); setState(undefined); }}>
                    <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                    <SelectContent>
                        {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={state} onValueChange={setState} disabled={statesForCountry.length === 0}>
                    <SelectTrigger><SelectValue placeholder="Select State (Optional)" /></SelectTrigger>
                    <SelectContent>
                        {statesForCountry.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
         {processedData.length > 0 && (
            <CardFooter className="border-t pt-6">
                <Button onClick={handleAiGeneration} disabled={!canGenerate}>
                    {isAiRunning ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                    {isAiRunning ? 'Generating...' : 'Generate Data with AI'}
                </Button>
            </CardFooter>
         )}
      </Card>

      {processedData.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Preview & Generate</CardTitle>
                   <CardDescription>
                        Review the data parsed from your CSV file. Click &quot;Generate Data with AI&quot; to process the links.
                    </CardDescription>
              </CardHeader>
              <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Generated Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Error</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {row.status === 'loading' && <Loader2 className="animate-spin h-4 w-4" />}
                                            <Badge variant={
                                                row.status === 'success' ? 'default' :
                                                row.status === 'error' ? 'destructive' :
                                                'secondary'
                                            }>
                                                {row.status}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium truncate max-w-xs"><a href={row.originalData.link} target='_blank' rel="noreferrer" className="hover:underline">{row.originalData.link}</a></TableCell>
                                    <TableCell>{row.aiData?.title}</TableCell>
                                    <TableCell>{row.originalData.categorySlug}</TableCell>
                                    <TableCell>
                                        {row.error && (
                                            <p className="text-xs text-destructive">{row.error}</p>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                    <Button onClick={handleSave} disabled={!canSave || isSaving || successfulRowsCount === 0}>
                         {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                        {isSaving ? 'Saving...' : `Save ${successfulRowsCount} Services`}
                    </Button>
                    {!canSave && processedData.length > 0 && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                           <AlertCircle className="h-4 w-4" /> Please fix errors or finish AI generation before saving.
                        </p>
                    )}
              </CardFooter>
          </Card>
      )}
    </div>
  );
}
