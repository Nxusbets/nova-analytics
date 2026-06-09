'use client';

import { Icons } from '@/components/icons';
import { motion } from 'motion/react';

const features = [
  {
    title: 'Real-time Analytics',
    description:
      'Stream live data from any source with sub-second latency. Make decisions on the freshest data available.',
    icon: Icons.trendingUp
  },
  {
    title: 'Custom Dashboards',
    description:
      'Drag-and-drop interface to build exactly the view your team needs. No coding required.',
    icon: Icons.dashboard
  },
  {
    title: 'Team Workspaces',
    description:
      'Collaborate across teams with shared dashboards, role-based access, and built-in commenting.',
    icon: Icons.teams
  },
  {
    title: 'Powerful Reports',
    description:
      'Generate automated reports with scheduled delivery. Export to PDF, CSV, or share via link.',
    icon: Icons.page
  },
  {
    title: 'Data Alerts',
    description:
      'Set intelligent thresholds and get notified via email, Slack, or webhook when metrics matter.',
    icon: Icons.notification
  },
  {
    title: 'Secure by Default',
    description:
      'Enterprise-grade security with SSO, audit logs, and SOC 2 compliance. Your data stays yours.',
    icon: Icons.lock
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0, 1] } }
};

export function LandingFeatures() {
  return (
    <section id='features' className='relative py-24 sm:py-32'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className='mx-auto max-w-2xl text-center'
        >
          <h2 className='text-foreground text-balance text-3xl font-bold tracking-tight sm:text-4xl'>
            Everything you need to understand your data
          </h2>
          <p className='text-muted-foreground mt-4 text-lg'>
            From real-time streaming to automated reporting — a complete analytics platform for
            modern teams.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          className='mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className='group relative rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md sm:p-8'
              >
                <div className='bg-primary/10 mb-4 flex size-10 items-center justify-center rounded-lg'>
                  <Icon className='text-primary size-5' />
                </div>
                <h3 className='text-foreground mb-2 text-lg font-semibold'>{feature.title}</h3>
                <p className='text-muted-foreground text-sm leading-relaxed'>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
