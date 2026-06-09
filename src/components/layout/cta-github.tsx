import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function CtaGithub() {
  return (
    <Button variant='ghost' asChild size='sm' className='group hidden sm:flex'>
      <a
        href='https://novaanalytics.io'
        rel='noopener noreferrer'
        target='_blank'
        className='dark:text-foreground text-sm font-medium transition-colors duration-300 hover:text-primary'
      >
        <Icons.dashboard className='size-4' />
        <span className='ml-1'>Nova</span>
      </a>
    </Button>
  );
}
