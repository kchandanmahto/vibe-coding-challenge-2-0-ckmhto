
import Link from "next/link";
import { features, roles, sports } from "./landing-data";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#101828] pt-[76px] text-white">
      <div
        className="absolute inset-y-0 right-0 w-full opacity-35 lg:w-[52%]"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#101828 5%,rgba(16,24,40,.45)),url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1600&q=85')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute right-[12%] top-32 hidden h-72 w-72 rounded-full border border-blue-400/20 lg:block" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
            Built for modern sports academies
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Run every part of your academy from one desk.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            Manage coaches, players, sessions, attendance, matches and player
            readiness with one clear, mobile-ready platform.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-lg bg-[#2563eb] px-6 text-sm font-semibold transition hover:bg-blue-500"
            >
              Login to Academy Desk
            </Link>
            <a
              href="#features"
              className="flex h-12 items-center justify-center rounded-lg border border-white/20 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore features
            </a>
          </div>
        </div>

        <div className="relative hidden min-h-[390px] lg:block">
          <div className="absolute bottom-8 right-0 w-[330px] rounded-2xl border border-white/15 bg-[#172033]/95 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Program overview</p>
                <p className="mt-1 font-semibold">Academy workspace</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs text-emerald-300">
                Active
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.06] p-4">
                <p className="text-xs text-slate-400">Sessions</p>
                <p className="mt-2 text-xl font-bold">Plan</p>
              </div>
              <div className="rounded-xl bg-white/[0.06] p-4">
                <p className="text-xs text-slate-400">Attendance</p>
                <p className="mt-2 text-xl font-bold">Track</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4">
              <p className="text-xs text-blue-300">Readiness overview</p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SportsSection() {
  return (
    <section id="sports" className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Sports workspace"
          title="Built around every training program"
          description="Manage different sports and training programs from one platform."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {sports.map((sport) => (
            <article
              key={sport.name}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eff5ff] text-sm font-bold text-[#2563eb]">
                {sport.mark}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {sport.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {sport.short}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#f4f7fb] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Platform features"
          title="One system for daily academy operations"
          description="Manage your academy activities with connected, role-focused workflows."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm"
            >
              <span className="text-xs font-bold tracking-[0.18em] text-blue-600">
                {feature.icon}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    ["01", "Configure your academy", "Set up the academy, sports and team roles."],
    ["02", "Organize daily operations", "Create sessions and mark attendance."],
    ["03", "Track player performance", "Record matches, scores and player progress."],
    ["04", "Review player readiness", "Use records to review player participation."],
  ];

  return (
    <section className="bg-white px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="How it works"
          title="From daily activity to clear insights"
          description="A simple workflow for your academy team."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title, description]) => (
            <div key={number}>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#2563eb] text-sm font-bold text-white">
                {number}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoleBenefits() {
  return (
    <section className="bg-[#101828] px-5 py-20 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            Purpose-built roles
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            The right workspace for every role
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {roles.map((item) => (
            <article
              key={item.role}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7"
            >
              <h3 className="text-xl font-semibold">{item.role}</h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.description}
              </p>

              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                {item.points.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-400">
                      ✓
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


export function AboutSection() {
  return (
    <section id="about" className="bg-white px-5 py-12 sm:px-8 sm:py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Academy Image */}
        <div
          className="group relative h-[250px] overflow-hidden rounded-2xl bg-slate-200 shadow-lg sm:h-[320px]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=85')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          role="img"
          aria-label="Sports academy training"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/55 to-transparent" />
          <div className="absolute bottom-5 left-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
              Dumka, Jharkhand
            </p>
            <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              Dumka Sports Academy
            </h3>
          </div>
        </div>

        {/* About Content */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            About Dumka Sports Academy
          </p>

          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Building better sports experiences
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Dumka Sports Academy brings players and coaches together through
            organized training, player development and better academy
            management. Our goal is to make sports activities more organized
            and easier to manage.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Organized sports training",
              "Player development",
              "Performance tracking",
              "Better academy management",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                  ✓
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <a
            href="#contact"
            className="mt-7 inline-flex h-10 items-center justify-center rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Contact the Academy
          </a>
        </div>
      </div>
    </section>
  );
}


export function GallerySection() {
  const gallery = [
    {
      title: "Football",
      image:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Cricket",
      image:
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Volleyball",
      image:
        "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Basketball",
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Athletics",
      image:
        "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Training",
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85",
    },
  ];

  return (
    <section id="gallery" className="bg-[#f4f7fb] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Academy gallery"
          title="Moments from the world of sports"
          description="Explore different sports, training and fitness activities."
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <article
              key={item.title}
              className="group relative h-64 overflow-hidden rounded-2xl bg-slate-900"
            >
              <div
                className="absolute inset-0 transition duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url('${item.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                role="img"
                aria-label={item.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/90 via-transparent to-transparent" />
              <h3 className="absolute bottom-5 left-5 text-xl font-semibold text-white">
                {item.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


export function ContactSection() {
  return (
    <section id="contact" className="bg-white px-5 py-12 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Get in touch"
          title="Connect with Dumka Sports Academy"
          description="Visit our academy or send us a message."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-stretch">
          {/* Map and Address */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <iframe
              title="Dumka Sports Academy location"
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3475.757528961753!2d87.26205967535253!3d24.285114678309604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjTCsDE3JzA2LjQiTiA4N8KwMTUnNTIuNyJF!5e1!3m2!1sen!2sin!4v1794031336833!5m2!1sen!2sin"
              width="100%"
              height="240"
              loading="lazy"
              className="h-[220px] w-full border-0 sm:h-[250px]"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />

            <div className="p-4 sm:p-5">
              <h3 className="text-base font-semibold text-slate-900">
                Dumka Sports Academy
              </h3>

              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Near Dumka Engineering College, Dumka, Jharkhand – 814101
              </p>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=24.28511465914241,87.26463457948796"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Get Directions →
              </a>

              <p className="mt-2 text-xs text-slate-400">
                Demo location details. Update before launch.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Send us a message
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Fill out the form and our team will get in touch.
            </p>

            <form className="mt-5 space-y-3.5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="How can we help?"
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={3}
                  placeholder="Write your message..."
                  required
                  className="w-full resize-y rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                className="flex h-10 w-full items-center justify-center rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Send Message
              </button>

              <p className="text-xs text-slate-400">
                Demo form: message submission will be connected later.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-xl text-left"
      }
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
        {description}
      </p>
    </div>
  );
}
