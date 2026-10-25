'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { activityIcons } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

const activitySchema = z.object({
    type: z.enum(['Running', 'Swimming', 'Cycling', 'Workout']),
    duration: z.coerce.number().min(1, 'Duration is required'),
    distance: z.coerce.number().optional(),
    calories: z.coerce.number().min(1, 'Calories are required'),
    steps: z.coerce.number().optional(),
    heartRate: z.coerce.number().optional(),
});

interface ActivityTrackerProps {
    initialActivities: Activity[];
}

export default function ActivityTracker({ initialActivities }: ActivityTrackerProps) {
    const { user, firestore } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof activitySchema>>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            type: 'Running',
            duration: '' as any,
            distance: '' as any,
            calories: '' as any,
            steps: '' as any,
            heartRate: '' as any,
        },
    });

    const onSubmit = (data: z.infer<typeof activitySchema>) => {
        if (!user) return;
        const now = new Date();
        const newActivity = {
            date: now.toISOString().split('T')[0],
            timestamp: now.toISOString(),
            userProfileId: user.uid,
            ...data
        };
        const activitiesRef = collection(firestore, 'users', user.uid, 'fitnessActivities');
        addDocumentNonBlocking(activitiesRef, newActivity);
        form.reset();
        setIsDialogOpen(false);
    };

    const handleDelete = (activityId: string) => {
        if (!user) return;
        const activityRef = doc(firestore, 'users', user.uid, 'fitnessActivities', activityId);
        deleteDocumentNonBlocking(activityRef);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Your latest workouts and activities.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="ml-auto gap-1">
                            <PlusCircle className="h-4 w-4" />
                            Log Activity
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log a New Activity</DialogTitle>
                            <DialogDescription>Fill in the details of your workout.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Activity Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an activity type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.keys(activityIcons).map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="duration" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (min)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="distance" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Distance (km)</FormLabel>
                                            <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField control={form.control} name="calories" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calories Burned</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                     <FormField control={form.control} name="steps" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Steps</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <FormField control={form.control} name="heartRate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Avg. Heart Rate (bpm)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit">Log Activity</Button>
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
                            <TableHead>Activity</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Calories</TableHead>
                            <TableHead>Steps</TableHead>
                            <TableHead>Heart Rate</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialActivities.map((activity) => {
                            const Icon = activityIcons[activity.type];
                            return (
                            <TableRow key={activity.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                                        <span>{activity.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{activity.duration} min</TableCell>
                                <TableCell>{activity.calories} kcal</TableCell>
                                <TableCell>{activity.steps ? activity.steps.toLocaleString() : 'N/A'}</TableCell>
                                <TableCell>{activity.heartRate ? `${activity.heartRate} bpm` : 'N/A'}</TableCell>
                                <TableCell>{format(parseISO(activity.timestamp), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleDelete(activity.id)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
