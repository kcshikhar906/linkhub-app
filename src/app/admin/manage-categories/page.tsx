'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type Category,
  categoryConverter,
  ICONS
} from '@/lib/data';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  iconName: z.string({ required_error: 'Please select an icon.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ManageCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('name')),
      (snapshot) => {
        setCategories(
          snapshot.docs.map((doc) =>
            categoryConverter.fromFirestore(doc)
          )
        );
        setIsCategoriesLoading(false);
      }
    );

    return () => {
      fetchCategories();
    };
  }, []);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      const categoriesCol = collection(db, 'categories').withConverter(
        categoryConverter
      );
      await addDoc(categoriesCol, data);
      toast({
        title: 'Category Added',
        description: 'The new category has been created.',
      });
      form.reset();
    } catch (error) {
      console.error('Error adding category: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add category. Check for duplicate slugs.',
      });
    }
    setIsLoading(false);
  };
  
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({
        title: 'Category Deleted',
        description: `"${name}" has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete category.',
      });
    }
  }

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                <CardTitle>Add a New Category</CardTitle>
                <CardDescription>
                    Create a new category for services. The slug must be unique.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-3">
                        <label htmlFor="name">Category Name</label>
                        <Input
                        id="name"
                        type="text"
                        placeholder="e.g., Visas and Immigration"
                        {...form.register('name')}
                        />
                        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="grid gap-3">
                        <label htmlFor="slug">Category Slug</label>
                        <Input
                        id="slug"
                        type="text"
                        placeholder="e.g., visas-and-immigration"
                        {...form.register('slug')}
                        />
                        {form.formState.errors.slug && <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>}
                    </div>
                </div>
                 <div className="grid gap-3">
                    <label htmlFor="iconName">Icon</label>
                    <Select onValueChange={(value) => form.setValue('iconName', value)}>
                    <SelectTrigger id="iconName" aria-label="Select icon">
                        <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(ICONS).map(([name, Icon]) => (
                        <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{name}</span>
                            </div>
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    {form.formState.errors.iconName && <p className="text-sm text-destructive">{form.formState.errors.iconName.message}</p>}
                </div>

                </CardContent>
                <CardFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
                    {isLoading ? 'Adding...' : 'Add Category'}
                </Button>
                </CardFooter>
            </form>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Existing Categories</CardTitle>
                <CardDescription>
                Manage the categories currently available.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isCategoriesLoading ? (
                    <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
                ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((cat) => {
                        const Icon = ICONS[cat.iconName];
                        return (
                            <TableRow key={cat.id}>
                                <TableCell className="font-medium">{cat.name}</TableCell>
                                <TableCell>{cat.slug}</TableCell>
                                <TableCell>
                                    {Icon && <Icon className="h-5 w-5" />}
                                </TableCell>
                                <TableCell>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(cat.id, cat.name)}>
                                        <Trash2  className="h-4 w-4"/>
                                    </Button>
                                </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
                </Table>
                )}
            </CardContent>
            </Card>
        </div>
    </div>
  );
}

    