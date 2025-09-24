// src/app/api/cron/route.ts
import {NextResponse} from 'next/server';
import {db} from '@/lib/firebase';
import {collection, getDocs, updateDoc, doc, getDoc, writeBatch, arrayUnion, serverTimestamp} from 'firebase/firestore';
import {isPast, isToday, parseISO, startOfDay} from 'date-fns';
import {sendDailySummary} from '@/ai/flows/send-daily-summary';

interface ScheduleItem {
  id: string;
  day: string;
  date: string;
  topic: string;
  tasks: string;
  status: 'pending' | 'completed' | 'missed';
}

interface StudyPlan {
  id: string;
  topic: string;
  schedule: ScheduleItem[];
  // Assuming there's a user associated with the plan
  userId: string; 
  // For simplicity, let's assume we have user's email on the plan
  userEmail: string; 
}

export async function GET() {
  try {
    const batch = writeBatch(db);
    const plansSnapshot = await getDocs(collection(db, 'studyPlans'));
    const today = startOfDay(new Date());

    for (const planDoc of plansSnapshot.docs) {
      const plan = {id: planDoc.id, ...planDoc.data()} as StudyPlan;
      let needsUpdate = false;
      const updatedSchedule = [...plan.schedule];

      const todaysTasks: { topic: string, tasks: string }[] = [];

      for (let i = 0; i < updatedSchedule.length; i++) {
        const item = updatedSchedule[i];
        const itemDate = startOfDay(parseISO(item.date));

        // Mark past, pending tasks as missed
        if (isPast(itemDate) && !isToday(itemDate) && item.status === 'pending') {
          updatedSchedule[i].status = 'missed';
          needsUpdate = true;
        }

        // Collect today's tasks for email
        if (isToday(itemDate)) {
          todaysTasks.push({ topic: item.topic, tasks: item.tasks });
        }
      }

      if (needsUpdate) {
        const planRef = doc(db, 'studyPlans', plan.id);
        batch.update(planRef, {schedule: updatedSchedule});
      }

      // Send email if there are tasks for today
      // For now, let's assume we have email and name.
      // In a real app this would come from a user profile.
      if (todaysTasks.length > 0 && plan.userEmail) {
        await sendDailySummary({
          email: plan.userEmail,
          name: 'Student', // Placeholder
          tasks: todaysTasks,
        });
      }
    }

    await batch.commit();

    return NextResponse.json({
      message: 'Cron job completed successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {message: 'Cron job failed.', error: (error as Error).message},
      {status: 500}
    );
  }
}
