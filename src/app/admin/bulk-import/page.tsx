'use client';

import { useState } from 'react';
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
import { Loader2, Upload, FileCheck2, AlertCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { z } from 'zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { serviceConverter } from '@/lib/data';


const serviceSchema = z.object({
    title: z.string().min(5, 'Title is too short'),
    link: z.string().url('Invalid URL'),
    categorySlug: z.string().min(1, 'Category slug is required'),
    description: z.string().min(10, 'Description is too short'),
    steps: z.string().min(10, 'Steps are required'),
    country: z.string().min(2, 'Country is required'),
    state: z.string().optional(),
    status: z.enum(['published', 'disabled']).default('published'),
});

type ServiceData = z.infer<typeof serviceSchema>;
type ParsedRow = {
    data: Partial<ServiceData>;
    isValid: boolean;
    errors: z.ZodError | null;
}


export default function BulkImportPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== 'text/csv') {
          toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a CSV file.'});
          return;
      }
      setFile(selectedFile);
      setParsedData([]); // Reset previous preview
    }
  };

  const handleParse = () => {
      if (!file) {
          toast({ variant: 'destructive', title: 'No File Selected', description: 'Please select a CSV file to parse.' });
          return;
      }
      setIsLoading(true);
      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
              const validatedData = results.data.map(row => {
                  const result = serviceSchema.safeParse(row);
                  return {
                      data: row as Partial<ServiceData>,
                      isValid: result.success,
                      errors: !result.success ? result.error : null,
                  };
              });
              setParsedData(validatedData);
              setIsLoading(false);
              toast({ title: 'File Parsed', description: 'Review the data below before saving.'});
          },
          error: (error) => {
              console.error("CSV Parsing Error:", error);
              toast({ variant: 'destructive', title: 'Parsing Error', description: 'Could not parse the CSV file.'});
              setIsLoading(false);
          }
      });
  };

  const handleSave = async () => {
    if (!allRowsValid) {
        toast({ variant: 'destructive', title: 'Invalid Data', description: 'Cannot save data with errors.'});
        return;
    }

    setIsSaving(true);
    try {
        const batch = writeBatch(db);
        const servicesCollection = collection(db, 'services').withConverter(serviceConverter);

        parsedData.forEach(row => {
            if (row.isValid) {
                const serviceDocRef = doc(servicesCollection);
                const serviceData = {
                    ...(row.data as ServiceData),
                    steps: (row.data.steps || '').split('\n').map(s => s.trim()).filter(Boolean),
                };
                batch.set(serviceDocRef, serviceData);
            }
        });

        await batch.commit();

        toast({
            title: 'Success!',
            description: `${parsedData.length} services have been imported successfully.`,
        });
        // Reset state
        setFile(null);
        setParsedData([]);

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

  const allRowsValid = parsedData.length > 0 && parsedData.every(row => row.isValid);


  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Services</CardTitle>
          <CardDescription>
            Upload a CSV file with service data to add multiple links at once.
            Ensure the CSV has headers: `title`, `link`, `categorySlug`, `description`, `steps`, `country`, `state`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="max-w-xs"
            />
            <Button onClick={handleParse} disabled={!file || isLoading}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <FileCheck2 className="mr-2" />}
              {isLoading ? 'Parsing...' : 'Preview Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Preview Data</CardTitle>
                   <CardDescription>
                        Review the data parsed from your CSV file. Rows with errors cannot be imported.
                    </CardDescription>
              </CardHeader>
              <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Errors</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parsedData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Badge variant={row.isValid ? 'default' : 'destructive'}>
                                            {row.isValid ? 'Valid' : 'Invalid'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{row.data.title}</TableCell>
                                    <TableCell>{row.data.categorySlug}</TableCell>
                                    <TableCell>{row.data.country}{row.data.state && `, ${row.data.state}`}</TableCell>
                                    <TableCell>
                                        {row.errors && (
                                            <ul className="text-xs text-destructive list-disc list-inside">
                                                {row.errors.issues.map(issue => (
                                                    <li key={issue.path.join('.')}>{issue.path.join('.')}: {issue.message}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                    <Button onClick={handleSave} disabled={!allRowsValid || isSaving}>
                         {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                        {isSaving ? 'Saving...' : 'Save to Database'}
                    </Button>
                    {!allRowsValid && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                           <AlertCircle className="h-4 w-4" /> Please fix the errors in your CSV file before saving.
                        </p>
                    )}
              </CardFooter>
          </Card>
      )}
    </div>
  );
}
