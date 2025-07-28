import { ProfileHeader } from "../components/ProfileHeader.tsx";
import { ProfessionalSummary } from "../components/ProfessionalSummary.tsx";
import { WorkExperience } from "../components/WorkExperience.tsx";
import { Education } from "../components/Education.tsx";
import { Certifications } from "../components/Certifications.tsx";
import { TechnicalSkills } from "../components/TechnicalSkills.tsx";
import { OpenSourceContributions } from "../components/OpenSourceContributions.tsx";
import { Achievements } from "../components/Achievements.tsx";
import { Languages } from "../components/Languages.tsx";
import LastUpdated from "../islands/LastUpdated.tsx";
import ThemeButton from "../islands/ThemeButton.tsx";

export default function Resume() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-4">
        <ThemeButton />

        <ProfileHeader />

        <main id="main" className="space-y-8" role="main">
          <ProfessionalSummary />
          <WorkExperience />
          <Education />
          <Certifications />
          <TechnicalSkills />
          <OpenSourceContributions />
          <Achievements />
          <Languages />
        </main>

        {/* Footer */}
        <footer className="pt-8 pb-4" role="contentinfo">
          <div className="border-t border-border pt-4">
            <LastUpdated />
          </div>
        </footer>
      </div>
    </div>
  );
}
