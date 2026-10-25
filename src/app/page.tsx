'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { HeartPulse, Target, LineChart, BrainCircuit, UserCheck, Calculator, Dumbbell } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  {
    icon: <Dumbbell className="w-8 h-8 text-primary" />,
    title: 'Activity Tracking',
    description: 'Log various fitness activities like running, swimming, and cycling with ease.',
    imageId: 'feature-workout'
  },
  {
    icon: <LineChart className="w-8 h-8 text-primary" />,
    title: 'Progress Visualization',
    description: 'Display progress with interactive charts and graphs to stay motivated.',
    imageId: 'feature-progress'
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: 'Goal Setting',
    description: 'Set daily or weekly fitness goals for steps, distance, or calories burned.',
    imageId: 'feature-goal'
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: 'Personalized Recommendations',
    description: 'Receive customized workout routines and health tips using generative AI.',
  },
  {
    icon: <UserCheck className="w-8 h-8 text-primary" />,
    title: 'User Authentication',
    description: 'Secure user accounts with login and registration features.',
  },
  {
    icon: <Calculator className="w-8 h-8 text-primary" />,
    title: 'BMI Calculation & Feedback',
    description: 'Calculate your BMI and get AI-powered feedback for improvements.',
  },
];

export default function LandingPage() {
  const heroImage = placeholderImages.find(p => p.id === 'hero');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // A logged in user should be redirected by the effect above, but if not, don't show the page.
  if (user) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <HeartPulse className="h-6 w-6 text-primary" />
          <span className="sr-only">HealthFlow</span>
        </Link>
        <h1 className="ml-2 text-2xl font-bold text-foreground font-headline">HealthFlow</h1>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative w-full pt-12 md:pt-24 lg:pt-32">
            <div className="absolute inset-0 -z-10">
                {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={heroImage.imageHint}
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-black/50" />
            </div>
          <div className="container px-4 md:px-6 text-center text-primary-foreground">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                Your Journey to a Healthier You Starts Here
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl">
                HealthFlow helps you track your fitness, set meaningful goals, and get personalized AI insights to keep you on the right path.
              </p>
            </div>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Your Flow
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our comprehensive suite of tools is designed to support you at every step of your fitness journey.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
              {features.map((feature) => {
                const image = placeholderImages.find(p => p.id === feature.imageId);
                return (
                  <Card key={feature.title} className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-4">
                      {feature.icon}
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                    {image && (
                      <CardFooter>
                        <div className="aspect-video overflow-hidden rounded-md">
                          <Image
                            src={image.imageUrl}
                            alt={image.description}
                            width={600}
                            height={400}
                            className="object-cover w-full h-full"
                            data-ai-hint={image.imageHint}
                          />
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 HealthFlow. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
