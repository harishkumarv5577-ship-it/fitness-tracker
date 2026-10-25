Claude
























Readme fitness tracker · MD
Fitness Tracker: AI-Powered Diet and Workout App
Fitness Tracker is a web application that helps users track their fitness and decide what to eat and how to train. Users can log activities, calculate their BMI, set goals, log meals, and get AI-generated diet plans and workout recommendations for dieting (fat loss) or bulking (muscle gain).

Built with Next.js, TypeScript, Google Genkit (Gemini) and Firebase.

Features
Activity tracking: log activities such as running, swimming and cycling, with calories burned and steps
Progress charts: interactive charts that show progress over time
Goal tracking: set daily or weekly goals for steps, distance or calories burned
BMI calculator: calculates BMI from height and weight, with AI feedback and suggested next steps
Diet plan suggestions: AI-generated food recommendations for a dieting (cut) or bulking goal
Food log: record meals and track what you eat
Food photo analysis: upload a photo of a meal and the AI identifies it and estimates its nutritional content
Personalized workout recommendations: AI-generated exercise suggestions based on the user's data
Authentication: user registration and login with Firebase
Light and dark theme, responsive on mobile and desktop
Tech Stack
Area	Technology
Framework	Next.js 15 (App Router), React 18
Language	TypeScript
Styling	Tailwind CSS, shadcn/ui, Radix UI
AI	Google Genkit with Gemini
Backend and database	Firebase (Authentication, Firestore)
Charts	Recharts
Forms and validation	React Hook Form, Zod
AI Features
The AI logic lives in src/ai/flows/, with one Genkit flow per task:

Flow	Purpose
diet-plan-suggestion	Generates a diet plan for a bulk or cut goal
personalized-workout-recommendations	Recommends workouts based on user data
bmi-feedback-and-suggestions	Gives feedback and next steps from the user's BMI
analyze-food-photo	Identifies a meal from a photo and estimates its nutrition
Project Structure
src/
  ai/            Genkit setup and AI flows (Gemini)
  app/           Pages and routes (dashboard, diet, profile, settings, login, register)
  components/    Dashboard components (activity tracker, BMI calculator, food log, goals, charts) and UI
  firebase/      Firebase setup, auth and Firestore hooks
  hooks/         Custom React hooks
  lib/           Types and utilities
docs/            App blueprint and backend schema
firestore.rules  Firestore security rules
Getting Started
Prerequisites
Node.js 18 or later
A Gemini API key from Google AI Studio
A Firebase project (Authentication and Firestore enabled)
Installation
bash
git clone https://github.com/harishkumarv5577-ship-it/fitness-tracker.git
cd fitness-tracker
npm install
Environment variables
Create a file named .env in the project root:

GEMINI_API_KEY=your_gemini_api_key_here
Add your own Firebase configuration in src/firebase/config.ts.

Never commit your .env file or share your API key.

Run the app
bash
npm run dev
Open http://localhost:9002 in your browser.

To test the AI flows on their own with the Genkit developer UI:

bash
npm run genkit:dev
Available Scripts
Command	What it does
npm run dev	Starts the development server on port 9002
npm run build	Creates a production build
npm run genkit:dev	Starts the Genkit developer UI
Author
V Harish Kumar B.Tech Computer Science and Engineering, Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology LinkedIn


Claude finished the response
