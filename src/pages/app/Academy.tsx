import { Routes, Route } from 'react-router-dom';
import { LearningDashboard, PathDetailView, CourseDetailView, LessonPlayerView } from '@/components/lms';

export default function Academy() {
  return (
    <Routes>
      <Route index element={<LearningDashboard />} />
      <Route path=":pathId" element={<PathDetailView />} />
      <Route path="course/:courseId" element={<CourseDetailView />} />
      <Route path="course/:courseId/lesson/:lessonId" element={<LessonPlayerView />} />
    </Routes>
  );
}
