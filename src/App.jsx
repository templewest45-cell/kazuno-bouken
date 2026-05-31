import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import KidsMode from './pages/KidsMode';
import TeacherMode from './pages/TeacherMode';
import ActivityS1 from './pages/ActivityS1';
import ActivityS2 from './pages/ActivityS2';
import ActivityS2FillBlank from './pages/ActivityS2FillBlank';
import ActivityS2Self from './pages/ActivityS2Self';
import ActivityS2Arrange from './pages/ActivityS2Arrange';
import ActivityS4 from './pages/ActivityS4';
import ComingSoon from './pages/ComingSoon';
import StageDetail from './pages/StageDetail';
import ActivityS1Count from './pages/ActivityS1Count';
import ActivityS1Arrange from './pages/ActivityS1Arrange';
import ActivityS1Which from './pages/ActivityS1Which';
import ActivityS3Continue from './pages/ActivityS3Continue';
import ActivityS3Reverse from './pages/ActivityS3Reverse';
import ActivityS3BeforeAfter from './pages/ActivityS3BeforeAfter';
import ActivityS3MultiBlank from './pages/ActivityS3MultiBlank';
import ActivityS3FillBlank from './pages/ActivityS3FillBlank';
import ActivityS4Match from './pages/ActivityS4Match';
import ActivityS4Flash from './pages/ActivityS4Flash';
import ActivityS4HowMany from './pages/ActivityS4HowMany';
import ActivityS4Hunt from './pages/ActivityS4Hunt';
import ActivityS4Sort from './pages/ActivityS4Sort';
import ActivityS5Split from './pages/ActivityS5Split';
import ActivityS5Join from './pages/ActivityS5Join';
import ActivityS5Missing from './pages/ActivityS5Missing';
import ActivityS5Bonds from './pages/ActivityS5Bonds';
import ActivityS6Compare from './pages/ActivityS6Compare';
import ActivityS6NumberLine from './pages/ActivityS6NumberLine';
import ActivityS6Sort from './pages/ActivityS6Sort';
import ActivityS6Between from './pages/ActivityS6Between';
import ActivityS6Hunt from './pages/ActivityS6Hunt';
import Profiles from './pages/Profiles';
import CastleCollection from './pages/CastleCollection';
import AppErrorBoundary from './pages/AppErrorBoundary';
import KidsModeViewport from './components/KidsModeViewport';

function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
      <KidsModeViewport />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kids" element={<KidsMode />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/kids/castle" element={<CastleCollection />} />
          <Route path="/teacher" element={<TeacherMode />} />
          <Route path="/kids/s1" element={<ActivityS1 />} />
          <Route path="/kids/s2" element={<ActivityS2 />} />
          <Route path="/kids/s2/fill" element={<ActivityS2FillBlank />} />
          <Route path="/kids/s2/self" element={<ActivityS2Self />} />
          <Route path="/kids/s2/arrange" element={<ActivityS2Arrange />} />
          <Route path="/kids/s4" element={<ActivityS4 />} />
          <Route path="/kids/soon" element={<ComingSoon />} />
          <Route path="/kids/stage/:id" element={<StageDetail />} />
          <Route path="/kids/s1/count" element={<ActivityS1Count />} />
          <Route path="/kids/s1/arrange" element={<ActivityS1Arrange />} />
          <Route path="/kids/s1/which" element={<ActivityS1Which />} />
          <Route path="/kids/s3/continue" element={<ActivityS3Continue />} />
          <Route path="/kids/s3/reverse" element={<ActivityS3Reverse />} />
          <Route path="/kids/s3/before-after" element={<ActivityS3BeforeAfter />} />
          <Route path="/kids/s3/multi-blank" element={<ActivityS3MultiBlank />} />
          <Route path="/kids/s3/fill-10" element={<ActivityS3FillBlank />} />
          <Route path="/kids/s4/match" element={<ActivityS4Match />} />
          <Route path="/kids/s4/flash" element={<ActivityS4Flash />} />
          <Route path="/kids/s4/how-many" element={<ActivityS4HowMany />} />
          <Route path="/kids/s4/hunt" element={<ActivityS4Hunt />} />
          <Route path="/kids/s4/sort" element={<ActivityS4Sort />} />
          <Route path="/kids/s5/split" element={<ActivityS5Split />} />
          <Route path="/kids/s5/join" element={<ActivityS5Join />} />
          <Route path="/kids/s5/missing" element={<ActivityS5Missing />} />
          <Route path="/kids/s5/bonds" element={<ActivityS5Bonds />} />
          <Route path="/kids/s6/compare" element={<ActivityS6Compare />} />
          <Route path="/kids/s6/numberline" element={<ActivityS6NumberLine />} />
          <Route path="/kids/s6/sort" element={<ActivityS6Sort />} />
          <Route path="/kids/s6/between" element={<ActivityS6Between />} />
          <Route path="/kids/s6/hunt" element={<ActivityS6Hunt />} />
        </Routes>
      </div>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
