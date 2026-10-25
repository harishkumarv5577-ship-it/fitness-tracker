'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import type { Activity, Goal } from '@/lib/types';
import { getPersonalizedRecommendationsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface PersonalizedRecommendationsProps {
  activities: Activity[];
  goals: Goal[];
  bmi: number;
}

export default function PersonalizedRecommendations({ activities, goals, bmi }: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (bmi > 0 && (activities.length > 0 || goals.length > 0)) {
        startTransition(async () => {
          setRecommendations(null);
          
          const result = await getPersonalizedRecommendationsAction({ activities, goals, bmi });

          if (result.success && result.data) {
            setRecommendations(result.data);
          } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
          }
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, goals, bmi]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6" />
          <span>AI-Powered Recommendations</span>
        </CardTitle>
        <CardDescription>
          Your personalized workout plan based on your recent activity and goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending && (
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Our AI is crafting your plan...</span>
            </div>
        )}

        {recommendations && !isPending && (
          <Alert className="bg-primary/5 border-primary/20">
            <AlertTitle className="text-primary font-bold">Your Personalized Plan</AlertTitle>
            <AlertDescription>
                <div className="mt-2 text-sm text-foreground whitespace-pre-wrap font-sans">
                  {recommendations}
                </div>
            </AlertDescription>
          </Alert>
        )}

        {!recommendations && !isPending && (
            <div className="text-center text-sm text-muted-foreground py-4">
                <p>Log some activities or set goals to generate a personalized workout plan.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
