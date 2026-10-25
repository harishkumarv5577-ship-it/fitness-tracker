# HealthFlow - A Next.js Fitness Application

This is a Next.js starter project built in Firebase Studio. It's a full-featured fitness tracking application with user authentication, activity logging, BMI calculation, and AI-powered recommendations.

## How to Deploy Your Website to Vercel (No GitHub Required)

Vercel is a platform from the creators of Next.js that makes it incredibly simple to publish your website. Deployment is free and handles everything for you.

### Step 1: Download Your Code

1.  **Download the Code**: Use the "Download Code" button in Firebase Studio to get a `.zip` file of your project.
2.  **Unzip the File**: Unzip the project folder on your computer (for example, in your `Downloads` folder).

### Step 2: Install the Vercel CLI

The Vercel CLI (Command Line Interface) is a tool that lets you deploy your site directly from your computer.

1.  **Open Command Prompt**: Open the Command Prompt application on your computer.
2.  **Install Vercel**: Run the following command to install the tool.
    ```bash
    npm install -g vercel
    ```

### Step 3: Deploy Your Website

1.  **Navigate to Your Project Folder**: In your Command Prompt, use the `cd` command to go into the project folder you unzipped.
    ```bash
    cd C:\Users\YourName\Downloads\your-project-folder-name
    ```
2.  **Log In to Vercel**: Run this command to connect to your Vercel account. It will likely ask you to enter the email you used to sign up for Vercel.
    ```bash
    vercel login
    ```
3.  **Deploy**: Finally, run the deploy command.
    ```bash
    vercel --prod
    ```

Vercel will ask you a few questions the first time:

*   "Set up and deploy...?" -> Press **Enter** to say **Yes**.
*   "Which scope...?" -> Press **Enter** to select your personal account.
*   "Link to existing project?" -> Type **n** and press **Enter** to say **No**.
*   "What's your project's name?" -> You can press **Enter** to accept the suggested name.
*   "In which directory is your code located?" -> You can press **Enter** to accept the default (`./`).

Vercel will automatically detect that this is a Next.js app and handle everything else. After it's done, it will give you a **public URL** for your live website!

**Important:** You will still need to add your `GEMINI_API_KEY` in your Vercel project's settings page on their website for the AI features to work.
