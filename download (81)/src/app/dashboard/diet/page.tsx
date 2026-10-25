
'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDietPlanAction } from '@/app/actions';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Loader2, Salad, Fish, Cookie, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';


const mealIcons: Record<string, React.ReactNode> = {
    'Breakfast': <Utensils className="w-5 h-5 mr-2 text-primary" />,
    'Lunch': <Salad className="w-5 h-5 mr-2 text-primary" />,
    'Snacks': <Cookie className="w-5 h-5 mr-2 text-primary" />,
    'Dinner': <Fish className="w-5 h-5 mr-2 text-primary" />,
}

function DietPlanDisplay({ plan, goal }: { plan: string | null; goal: 'bulk' | 'cut' }) {
    if (!plan) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                Select your preferences and a goal to generate your personalized one-day diet plan.
            </div>
        );
    }
    
    const sections = plan.split('### ').filter(s => s.trim() !== '');

    const introAndTitle = sections.length > 0 && !Object.keys(mealIcons).some(key => sections[0].startsWith(key)) 
        ? sections.shift()?.trim().split('\n')
        : [`Your Daily ${goal === 'bulk' ? 'Bulking' : 'Cutting'} Plan`];
    
    const mainTitle = introAndTitle.length > 0 ? introAndTitle[0] : '';
    const introParagraph = introAndTitle.length > 1 ? introAndTitle.slice(1).join('\n') : '';
    
    return (
        <div className="space-y-6">
             <h2 className="text-3xl font-bold text-center font-headline text-primary">{mainTitle}</h2>
             {introParagraph && (
                <p className="text-center text-muted-foreground text-sm">{introParagraph}</p>
             )}
             <div className="grid md:grid-cols-2 gap-6">
                {sections.map((section, index) => {
                    const lines = section.split('\n');
                    const title = lines.shift()?.trim() || '';
                    const content = lines.join('\n').trim();

                    return (
                        <div key={index} className="bg-card border-2 border-primary/20 rounded-xl p-6 shadow-lg transition-all hover:shadow-xl hover:border-primary/40">
                           <div className="flex items-center font-headline text-2xl font-bold mb-4 text-primary">
                                {mealIcons[title] || <Utensils className="w-6 h-6 mr-2" />}
                                {title}
                            </div>
                           <div className={cn("text-base text-card-foreground/90 space-y-3", "font-sans")}>
                                {content.split('\n').filter(line => line.trim()).map((item, i) => (
                                    <p key={i} className="leading-relaxed">{item}</p>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function DietPage() {
    const { user, firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [bulkPlan, setBulkPlan] = useState<string | null>(null);
    const [cutPlan, setCutPlan] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'bulk' | 'cut'>('bulk');
    const [dietaryPreference, setDietaryPreference] = useState<'vegetarian' | 'non-vegetarian'>('non-vegetarian');
    const [medicalCondition, setMedicalCondition] = useState<string>('None');
    const [otherMedicalCondition, setOtherMedicalCondition] = useState('');


    const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const bmi = useMemo(() => {
        if (!userProfile || !userProfile.height || !userProfile.weight) return 0;
        const heightInMeters = userProfile.height / 100;
        return userProfile.weight / (heightInMeters * heightInMeters);
    }, [userProfile]);

    const handleGeneratePlan = (goal: 'bulk' | 'cut') => {
        if (bmi <= 0) {
            toast({
                title: "BMI Required",
                description: "Please calculate your BMI on the dashboard before generating a diet plan.",
                variant: "destructive"
            });
            return;
        }

        const condition = medicalCondition === 'Other' ? otherMedicalCondition : medicalCondition;
        if (medicalCondition === 'Other' && !otherMedicalCondition.trim()) {
             toast({
                title: "Medical Condition Required",
                description: "Please specify your medical condition.",
                variant: "destructive"
            });
            return;
        }

        if (goal === 'bulk') setBulkPlan(null);
        if (goal === 'cut') setCutPlan(null);
        
        startTransition(async () => {
            const result = await getDietPlanAction({
                goal, 
                bmi, 
                dietaryPreference, 
                medicalCondition: condition
            });
            if (result.success && result.data) {
                if (goal === 'bulk') {
                    setBulkPlan(result.data);
                } else {
                    setCutPlan(result.data);
                }
            } else {
                toast({
                    title: `Failed to generate ${goal} plan`,
                    description: result.error,
                    variant: "destructive"
                });
            }
        });
    }
    
    const isPlanGenerated = (activeTab === 'bulk' && bulkPlan) || (activeTab === 'cut' && cutPlan);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Diet Planner</CardTitle>
                    <CardDescription>
                        Get a personalized one-day diet plan. Your current BMI of <span className="font-bold text-primary">{bmi > 0 ? bmi.toFixed(1) : 'N/A'}</span> will be used for personalization.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <Label>Dietary Preference</Label>
                             <RadioGroup value={dietaryPreference} onValueChange={(val) => setDietaryPreference(val as 'vegetarian' | 'non-vegetarian')} className="flex gap-4">
                                <div>
                                    <RadioGroupItem value="non-vegetarian" id="non-vegetarian" className="peer sr-only" />
                                    <Label htmlFor="non-vegetarian" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 px-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                        Non-Vegetarian
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="vegetarian" id="vegetarian" className="peer sr-only" />
                                    <Label htmlFor="vegetarian" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 px-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                        Vegetarian
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="medical-condition">Medical Conditions</Label>
                             <Select value={medicalCondition} onValueChange={setMedicalCondition}>
                                <SelectTrigger id="medical-condition">
                                    <SelectValue placeholder="Select a condition" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="Heart Patient">Heart Patient</SelectItem>
                                    <SelectItem value="Diabetes">Diabetes</SelectItem>
                                    <SelectItem value="Blood Pressure">Blood Pressure</SelectItem>
                                    <SelectItem value="Kidney">Kidney Issues</SelectItem>
                                    <SelectItem value="Thyroid">Thyroid Issues</SelectItem>
                                    <SelectItem value="PCOS">PCOS</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                             <p className="text-xs text-muted-foreground">Disclaimer: This is not medical advice. Consult a doctor.</p>
                        </div>
                    </div>

                    {medicalCondition === 'Other' && (
                        <div className="space-y-2">
                            <Label htmlFor="other-medical-condition">Please specify your condition</Label>
                            <Input 
                                id="other-medical-condition" 
                                value={otherMedicalCondition} 
                                onChange={(e) => setOtherMedicalCondition(e.target.value)}
                                placeholder="e.g., Celiac Disease"
                            />
                        </div>
                    )}

                    <Tabs value={activeTab} className="w-full" onValueChange={(val) => setActiveTab(val as 'bulk' | 'cut')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="bulk">Bulking Plan</TabsTrigger>
                            <TabsTrigger value="cut">Cutting Plan</TabsTrigger>
                        </TabsList>

                        <div className="mt-4">
                            <Button onClick={() => handleGeneratePlan(activeTab)} disabled={isPending} className="w-full">
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isPlanGenerated ? 'Regenerate' : 'Generate'} {`${activeTab === 'bulk' ? 'Bulking' : 'Cutting'} Plan`}
                            </Button>
                        </div>
                        
                        <TabsContent value="bulk" className="mt-4">
                            {isPending && activeTab === 'bulk' ? (
                                 <div className="flex items-center justify-center p-8">
                                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                                    <span className="text-muted-foreground">Generating your bulking plan...</span>
                                </div>
                            ) : (
                                <DietPlanDisplay plan={bulkPlan} goal="bulk" />
                            )}
                        </TabsContent>
                        <TabsContent value="cut" className="mt-4">
                             {isPending && activeTab === 'cut' ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                                    <span className="text-muted-foreground">Generating your cutting plan...</span>
                                </div>
                            ) : (
                                <DietPlanDisplay plan={cutPlan} goal="cut" />
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
