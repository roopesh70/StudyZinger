# Adaptive Study Scheduler

A responsive, **Next.js full-stack web app** that generates **personalized, day-by-day study schedules** for any topic using **Google’s Gemini model**.  
It adapts to user performance, curates resources, and keeps learners motivated with AI-driven features, analytics, reminders, and gamification.

---

## ✨ Key Features

### 📚 AI-Powered Learning
- **Personalized Study Schedule Generation**  
  - AI flow `generatePersonalizedStudySchedule` creates a detailed plan based on topic, duration, and skill level.  
  - Generates introductory notes and reference links.
- **AI Chat Assistant** (`chat`)  
  - Ask study questions and receive detailed, formatted answers.
- **Daily Motivational Quotes** (`getDailyMotivationalQuote`)  
  - Fresh AI-generated quote displayed in the sidebar each day.
- **On-Demand Notes** (`getNotesForTopic`)  
  - “Today’s Notes” button dynamically generates notes and references for the current topic.
- **External Resource Curation** (`curateExternalStudyResources`)  
  - Finds and recommends relevant articles, videos, and open resources.
- **Personalized Study Tips** (`providePersonalizedStudyTips`)  
  - Analyzes your habits and suggests improvements on the Progress page.
- **Automated Email Summaries** (`sendDailySummary`)  
  - Daily cron job emails a Gemini-generated summary of your tasks via **Mailjet API**.

### 🎮 Engagement & Collaboration
- Gamification with points, badges, and streaks.
- Optional real-time study-group sharing via WebSockets.
- Progress dashboard with Recharts visualizations (completion rates, time spent, weak areas).
- Email/SMS reminders (Mailjet/Twilio) and Google Calendar sync.
- Multi-language support powered by Gemini translation.

---

## 🛠 Tech Stack

| Layer            | Technology / Library                              |
|------------------|---------------------------------------------------|
| **Frontend**     | **Next.js (App Router)** for structure & rendering |
| **UI**           | React + **ShadCN UI** components                  |
| **Styling**      | **Tailwind CSS**, utility-first with Dark Mode     |
| **Forms**        | **React Hook Form** + **Zod** for validation       |
| **Database**     | **Firebase Firestore** (NoSQL)                    |
| **Charts**       | **Recharts** for progress analytics               |
| **Icons**        | **Lucide React**                                  |
| **AI**           | **Google Gemini** via **Genkit** for structured flows |
| **Integrations** | Mailjet/Twilio for email/SMS, Google Calendar API  |
| **Realtime**     | WebSockets or Firebase Realtime Database          |

---

## 🚀 Getting Started


# DONE WITH FIREBASE STUDIO AI