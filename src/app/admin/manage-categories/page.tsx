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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  type Category,
  categoryConverter,
  ICONS
} from '@/lib/data';
import { CATEGORY_TAGS } from '@/lib/category-tags';
import { PlusCircle, Trash2, Loader2, GripVertical } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  iconName: z.string({ required_error: 'Please select an icon.' }),
});

type FormValues = z.infer<typeof formSchema>;


export default function ManageCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

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
    return () => fetchCategories();
  }, []);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <AddCategoryDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>
            Manage the categories and their associated sub-categories (tags) currently available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCategoriesLoading ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const Icon = ICONS[cat.iconName];
                const tags = CATEGORY_TAGS[cat.slug] || [];
                return (
                  <Card key={cat.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div className="flex items-center gap-3">
                            {Icon && <Icon className="h-6 w-6 text-primary" />}
                            <CardTitle className="text-lg font-semibold leading-tight">{cat.name}</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2" onClick={() => handleDelete(cat.id, cat.name)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-xs text-muted-foreground mb-3">{cat.slug}</p>
                        <Separator />
                         <ScrollArea className="h-32 mt-3">
                             <div className="flex flex-wrap gap-2">
                                {tags.length > 0 ? tags.map(tag => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                )) : <p className="text-xs text-muted-foreground">No sub-categories defined.</p>}
                            </div>
                         </ScrollArea>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddCategoryDialog() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setIsLoading(true);
        try {
            const categoriesCol = collection(db, 'categories').withConverter(categoryConverter);
            await addDoc(categoriesCol, data);
            toast({
                title: 'Category Added',
                description: 'The new category has been created.',
            });
            form.reset();
            setIsOpen(false);
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" /> Add Category
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a New Category</DialogTitle>
                    <DialogDescription>
                        Create a new category for services. The slug must be unique.
                    </DialogDescription>
                </DialogHeader>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                     <DialogFooter className="pt-4">
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
                            {isLoading ? 'Adding...' : 'Add Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
