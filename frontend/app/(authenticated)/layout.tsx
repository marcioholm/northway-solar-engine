import PageLayout from '../../components/layouts/PageLayout';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <PageLayout>{children}</PageLayout>;
}
