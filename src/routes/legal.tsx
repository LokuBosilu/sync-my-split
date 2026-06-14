import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Terms of Use — Kova" },
      { name: "description", content: "Kova Privacy Policy and Terms of Use." },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <header className="px-6 md:px-10 pt-8 pb-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
          <span className="font-display text-2xl tracking-widest text-foreground">GYMSYNC</span>
        </Link>
      </header>

      <main className="px-6 md:px-10 pb-24 max-w-3xl mx-auto space-y-16 fade-slide-in">
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-display">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">
            Kova ("we", "our", or "the app") provides personalized gym workout plans based on information you give us. This policy explains what information we collect, how we use it, and what choices you have.
          </p>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you use Kova, we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Account information</strong> — your email address, used to sign you in and identify your account.</li>
              <li><strong className="text-foreground">Profile information</strong> — your name, age, height, weight, fitness goals, and the gym equipment available to you.</li>
              <li><strong className="text-foreground">Workout data</strong> — the workout plans generated for you, your plan history, and any weight measurements you log.</li>
              <li><strong className="text-foreground">Gym membership information</strong> — if you join through a gym's invite link, we store which gym you're associated with.</li>
              <li><strong className="text-foreground">Usage information</strong> — basic activity such as when you last opened the app, used to keep your plan up to date.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">How We Use Your Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>Generate a personalized workout plan based on your stats, goals, and available equipment.</li>
              <li>Save and update your plan over time, including progression after each 8-week cycle.</li>
              <li>Show your gym (if applicable) basic information about your membership and engagement, such as your name, goal, and plan status.</li>
              <li>Track your weight over time if you choose to log it.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not sell your personal information to anyone.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">How Your Information Is Stored</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is stored securely using Supabase, a third-party database provider. Access to your data is restricted using row-level security, meaning only you (and your gym's administrators, if you joined via a gym) can access your information.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Third-Party Services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To generate your workout plan, we send your profile information (age, height, weight, goals, and equipment list) to Google's Gemini AI model via Lovable's AI Gateway. This information is used only to generate your plan and is not stored by the AI provider beyond processing your request.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Gym Access to Your Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you join Kova through a gym's invite link, your gym's administrators can see:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>Your name and email</li>
              <li>Your fitness goal</li>
              <li>Your plan status (active, expiring soon, or expired)</li>
              <li>When you were last active</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gym administrators cannot see the detailed content of your workout plans unless you choose to share it, or unless your gym uses the "View Plan" feature, which shows your current plan in read-only form to help them support you.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Your Rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Access</strong> the information we hold about you.</li>
              <li><strong className="text-foreground">Correct</strong> inaccurate information by updating your profile.</li>
              <li><strong className="text-foreground">Delete</strong> your account and all associated data, using the "Start Over" option in the app or by contacting us.</li>
              <li><strong className="text-foreground">Export</strong> your workout history by requesting it from us.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We keep your information for as long as your account is active. If you delete your account, your profile, plans, and weight logs are permanently removed from our systems.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Children's Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kova is not intended for use by anyone under the age of 16. We do not knowingly collect information from children.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this policy from time to time. If we make significant changes, we will notify users within the app.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about this policy or your data, you can contact us at:{" "}
              <a href="mailto:researchtechhex@gmail.com" className="text-primary underline hover:text-primary/80">
                researchtechhex@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-display">Terms of Use</h1>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>By using Kova, you agree to the following:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Kova provides general fitness guidance generated by AI based on the information you provide. It is not a substitute for professional medical or fitness advice.</li>
              <li>You should consult a doctor before starting any new exercise program, especially if you have any pre-existing health conditions.</li>
              <li>Kova is not responsible for any injury or health issue resulting from following a generated workout plan.</li>
              <li>You are responsible for the accuracy of the information you provide (age, weight, height, etc.), as your plan is generated based on this data.</li>
              <li>You must be at least 16 years old to use Kova.</li>
              <li>We reserve the right to suspend or terminate accounts that misuse the service.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
