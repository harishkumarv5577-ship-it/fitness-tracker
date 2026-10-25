'use client';

import { useState, useRef, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, MoreHorizontal, Apple, Camera, Sparkles, Loader2 } from 'lucide-react';
import type { FoodLog } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { analyzeFoodPhotoAction } from '@/app/actions';
import Image from 'next/image';

const foodLogSchema = z.object({
    mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
    foodName: z.string().min(1, 'Food name is required'),
    calories: z.coerce.number().min(1, 'Calories are required'),
    protein: z.coerce.number().min(0, 'Protein is required'),
    photoUrl: z.string().optional(),
});

interface FoodLogTrackerProps {
    initialFoodLogs: FoodLog[];
}

export default function FoodLogTracker({ initialFoodLogs }: FoodLogTrackerProps) {
    const { user, firestore } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAnalyzing, startAnalyzingTransition] = useTransition();
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof foodLogSchema>>({
        resolver: zodResolver(foodLogSchema),
        defaultValues: {
            mealType: 'Breakfast',
            foodName: '',
            calories: '' as any,
            protein: '' as any,
            photoUrl: '',
        },
    });

    const resetFormAndState = () => {
        form.reset({
            mealType: 'Breakfast',
            foodName: '',
            calories: '' as any,
            protein: '' as any,
            photoUrl: '',
        });
        setPhotoPreview(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                form.setValue('photoUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = () => {
        const photoDataUri = form.getValues('photoUrl');
        if (!photoDataUri) {
            toast({ title: "No Photo", description: "Please select a photo to analyze.", variant: "destructive" });
            return;
        }

        startAnalyzingTransition(async () => {
            const result = await analyzeFoodPhotoAction(photoDataUri);
            if (result.success && result.data) {
                form.setValue('foodName', result.data.foodName);
                form.setValue('calories', result.data.calories);
                form.setValue('protein', result.data.protein);
                toast({ title: "Analysis Complete", description: "The nutritional information has been filled in." });
            } else {
                toast({ title: "Analysis Failed", description: result.error, variant: "destructive" });
            }
        });
    };
    
    const onSubmit = (data: z.infer<typeof foodLogSchema>) => {
        if (!user) return;
        const now = new Date();
        const newFoodLog = {
            date: now.toISOString().split('T')[0],
            timestamp: now.toISOString(),
            userProfileId: user.uid,
            ...data
        };
        const foodLogsRef = collection(firestore, 'users', user.uid, 'foodLogs');
        addDocumentNonBlocking(foodLogsRef, newFoodLog);
        resetFormAndState();
        setIsDialogOpen(false);
    };

    const handleDelete = (foodLogId: string) => {
        if (!user) return;
        const foodLogRef = doc(firestore, 'users', user.uid, 'foodLogs', foodLogId);
        deleteDocumentNonBlocking(foodLogRef);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Food Log</CardTitle>
                    <CardDescription>Track your meals and nutritional intake.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (!open) resetFormAndState();
                    setIsDialogOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="ml-auto gap-1">
                            <PlusCircle className="h-4 w-4" />
                            Log Meal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="overflow-y-auto max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Log a New Meal</DialogTitle>
                            <DialogDescription>Upload a photo for AI analysis or enter details manually.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Meal Photo</Label>
                                    <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                    <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                        <Camera className="mr-2 h-4 w-4" />
                                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                    </Button>
                                    {photoPreview && (
                                        <div className="relative mt-2 w-full aspect-video rounded-md overflow-hidden border">
                                            <Image src={photoPreview} alt="Meal preview" fill className="object-cover" />
                                        </div>
                                    )}
                                </div>
                                
                                {photoPreview && (
                                    <Button type="button" onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                                        {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                        Analyze with AI
                                    </Button>
                                )}

                                <FormField control={form.control} name="mealType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meal Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a meal type" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Breakfast">Breakfast</SelectItem>
                                                <SelectItem value="Lunch">Lunch</SelectItem>
                                                <SelectItem value="Dinner">Dinner</SelectItem>
                                                <SelectItem value="Snack">Snack</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="foodName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Food/Meal Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Grilled Chicken Salad" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="calories" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calories (kcal)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="protein" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Protein (g)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                    <Button type="submit">Log Meal</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Meal</TableHead>
                            <TableHead>Calories</TableHead>
                            <TableHead>Protein</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialFoodLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {log.photoUrl ? (
                                             <div className="relative w-10 h-10 rounded-md overflow-hidden">
                                                <Image src={log.photoUrl} alt={log.foodName} fill className="object-cover" />
                                             </div>
                                        ) : (
                                            <Apple className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <div>
                                            <p className="font-semibold">{log.foodName}</p>
                                            <p className="text-xs text-muted-foreground">{log.mealType}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{log.calories} kcal</TableCell>
                                <TableCell>{log.protein} g</TableCell>
                                <TableCell>{format(parseISO(log.timestamp), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleDelete(log.id)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
