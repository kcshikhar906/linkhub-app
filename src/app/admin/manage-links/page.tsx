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
import { Textarea } from '@/components/ui/textarea';
import { SERVICES, CATEGORIES } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, PlusCircle, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ManageLinksPage() {
  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add a New Service</CardTitle>
            <CardDescription>
              Manually add a new service to the directory. This will be
              published immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <label htmlFor="title">Service Title</label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., How to apply for a TFN"
              />
            </div>
            <div className="grid gap-3">
              <label htmlFor="url">Official URL</label>
              <Input
                id="url"
                type="url"
                placeholder="https://service.gov.au/..."
              />
            </div>
            <div className="grid gap-3">
              <label htmlFor="category">Category</label>
              <Select>
                <SelectTrigger id="category" aria-label="Select category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <label htmlFor="description">Short Description</label>
              <Textarea
                id="description"
                placeholder="A brief explanation of the service."
              />
            </div>
            <div className="grid gap-3">
              <label htmlFor="steps">
                Steps (one per line)
              </label>
              <Textarea
                id="steps"
                placeholder="Step 1...\nStep 2...\nStep 3..."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <PlusCircle className="mr-2" />
              Add Service
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing Services</CardTitle>
            <CardDescription>
              Manage the services currently listed on the site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Link</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SERVICES.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      {service.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{service.categorySlug}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <a
                        href={service.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {service.link.substring(0, 40)}...
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
