'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { getBmiFeedbackAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, collection } from 'firebase/firestore';

interface BmiCalculatorProps {
  userProfile: UserProfile | null;
}

export default function BmiCalculator({ userProfile }: BmiCalculatorProps) {
  const { user, firestore } = useFirebase();
  const [height, setHeight] = useState<string>(userProfile?.height?.toString() || '');
  const [weight, setWeight] = useState<string>(userProfile?.weight?.toString() || '');
  const [feedback, setFeedback] = useState<{ feedback: string, suggestions: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile) {
        setHeight(userProfile.height > 0 ? userProfile.height.toString() : '');
        setWeight(userProfile.weight > 0 ? userProfile.weight.toString() : '');
    }
  }, [userProfile]);

  const bmi = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      return (w / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return '0.0';
  }, [height, weight]);

  const bmiCategory = useMemo(() => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { text: 'Underweight', color: 'text-blue-500' };
    if (bmiValue < 25) return { text: 'Normal weight', color: 'text-green-500' };
    if (bmiValue < 30) return { text: 'Overweight', color: 'text-yellow-500' };
    return { text: 'Obesity', color: 'text-red-500' };
  }, [bmi]);

  const updateProfileAndBmi = () => {
    if (!user) return;
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue) || bmiValue <= 0) return;

    const numHeight = parseFloat(height);
    const numWeight = parseFloat(weight);

    const userRef = doc(firestore, 'users', user.uid);
    setDocumentNonBlocking(userRef, { height: numHeight, weight: numWeight }, { merge: true });

    const bmiRecord = {
        userProfileId: user.uid,
        height: numHeight,
        weight: numWeight,
        bmi: bmiValue,
        timestamp: new Date().toISOString(),
    };
    const bmiRef = doc(collection(firestore, 'users', user.uid, 'bmiRecords'));
    setDocumentNonBlocking(bmiRef, bmiRecord, { merge: true });
  }

  const handleGetFeedback = () => {
    startTransition(async () => {
        setFeedback(null);
        const bmiValue = parseFloat(bmi);
        if (isNaN(bmiValue) || bmiValue <= 0) {
            toast({ title: "Invalid BMI", description: "Please enter valid height and weight.", variant: "destructive" });
            return;
        }

        updateProfileAndBmi();

        const result = await getBmiFeedbackAction(bmiValue);
        if (result.success && result.data) {
            setFeedback(result.data);
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          <span>BMI Calculator</span>
        </CardTitle>
        <CardDescription>Calculate your Body Mass Index.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="text-center bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Your BMI</p>
            <p className="text-4xl font-bold">{bmi}</p>
            <p className={`text-sm font-semibold ${bmiCategory.color}`}>{bmiCategory.text}</p>
        </div>
        <Button onClick={handleGetFeedback} disabled={isPending || !height || !weight} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Get AI Feedback & Save
        </Button>

        {isPending && <div className="text-center text-sm text-muted-foreground">Generating feedback...</div>}

        {feedback && (
             <Alert>
                <AlertTitle>{feedback.feedback}</AlertTitle>
                <AlertDescription>
                    <p className="mt-2 whitespace-pre-wrap">{feedback.suggestions}</p>
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
