import ProjectDetails from '@/components/ProjectDetails';
import { Metadata } from 'next';

interface Props {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: Props) {
  return <ProjectDetails id={params.id} />;
}
