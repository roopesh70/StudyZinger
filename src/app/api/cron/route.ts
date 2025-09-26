// src/app/api/cron/route.ts
import {NextResponse} from 'next/server';
import {db} from '@/lib/firebase';
import {collectionGroup, getDocs, updateDoc, doc, getDoc, writeBatch, serverTimestamp} from 'firebase/firestore';
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
  userId: string;
  userEmail: string;
  userName?: string;
}

// Function to get user data from a separate 'users' collection
async function getUserProfile(userId: string): Promise<{ email: string; name: string } | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
            email: userData.email,
            name: userData.displayName || 'Student',
        };
    }
    return null;
}


export async function GET() {
  try {
    const batch = writeBatch(db);
    const plansSnapshot = await getDocs(collectionGroup(db, 'studyPlans'));
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
        // The reference now needs to point to the subcollection document
        const planRef = doc(db, 'users', plan.userId, 'studyPlans', plan.id);
        batch.update(planRef, {schedule: updatedSchedule});
      }

      // Send email if there are tasks for today
      if (todaysTasks.length > 0 && plan.userId) {
         const userProfile = await getUserProfile(plan.userId);
         if (userProfile) {
            await sendDailySummary({
              email: userProfile.email,
              name: userProfile.name,
              tasks: todaysTasks,
            });
         }
      }
       // Add a notification for missed tasks
      if (needsUpdate) {
          const missedTasksCount = updatedSchedule.filter(item => item.status === 'missed' && isPast(parseISO(item.date)) && !isToday(parseISO(item.date))).length;
          if (missedTasksCount > 0) {
            const notificationRef = doc(db, `users/${plan.userId}/notifications`);
            batch.set(notificationRef, {
                message: `You missed ${missedTasksCount} task(s) from your "${plan.topic}" plan. Catch up!`,
                read: false,
                createdAt: serverTimestamp(),
                type: 'warning'
            });
          }
      }
        
      // Add a notification for today's tasks
      if (todaysTasks.length > 0) {
          const notificationRef = doc(db, `users/${plan.userId}/notifications`);
          batch.set(notificationRef, {
              message: `You have ${todaysTasks.length} task(s) for "${plan.topic}" today. Let's get to it!`,
              read: false,
              createdAt: serverTimestamp(),
              type: 'reminder'
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
